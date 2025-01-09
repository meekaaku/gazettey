// Install required packages:
// bun add @xenova/transformers pg pdf-parse dotenv

import { pipeline } from '@xenova/transformers';
import pkg from 'pg';
import * as pdfParse from 'pdf-parse';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { POSTGRES_PASSWORD} from '$env/static/private';

dotenv.config();

// PostgreSQL configuration
const { Pool } = pkg;
export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize the embedding pipeline
let embedder:any = null;

function chunkText(text:string, maxChunkLength = 512) {
  // Split into sentences (basic implementation)
  const sentences = text.split(/[.!?]+/);
  const chunks = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + '. ';
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

async function initializeEmbedder() {
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  //embedder = await pipeline('feature-extraction', 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2');
  //embedder = await pipeline('feature-extraction', 'intfloat/multilingual-e5-large');
   // embedder = await pipeline('feature-extraction', 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2');
}

async function createEmbedding(text:string) {
    if (!embedder) await initializeEmbedder();
    
    const output = await embedder(text, {
        pooling: 'mean',
        normalize: true,
    });
  
    return Array.from(output.data).map(num => Number(num));
}

async function extractTextFromPDF(filePath:string) {
  const dataBuffer = await readFile(filePath);
  const data = await pdfParse.default(dataBuffer);
  return data.text;
}

async function extractTextFromFile(filePath:string) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    return await extractTextFromPDF(filePath);
  } else if (ext === '.txt') {
    return await readFile(filePath, 'utf8');
  }
  
  throw new Error(`Unsupported file type: ${ext}`);
}

async function setupDatabase() {
  // Create the documents table with pgvector extension
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding vector(384),
      language TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function detectLanguage(text:string) {
  // Simple language detection based on character set
  // This is a basic implementation - you might want to use a proper language detection library
  const dhivehiChars = /[\u0780-\u07BF]/; // Thaana script Unicode range
  return dhivehiChars.test(text) ? 'dv' : 'en';
}

async function processFile(filePath:string) {
  try {
    const filename = path.basename(filePath);
    const content = await extractTextFromFile(filePath);
    const language = detectLanguage(content);
    const embedding = await createEmbedding(content);

    const chunks = chunkText(content);


    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await createEmbedding(chunk);
      
      // Format the embedding array for pgvector
      const embeddingString = `[${embedding.join(',')}]`;
      
      // Store in database using the correct vector syntax
      await pool.query(
        `INSERT INTO documents (filename, content, embedding_1, chunk_index)
         VALUES ($1, $2, $3::vector, $4)`,
        [filename, chunk, embeddingString, i]
      );
      
      console.log(`Processed ${filename} chunk ${i+1}/${chunks.length} (${language})`);
    }



    
    console.log(`Processed ${filename} (${language})`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}



export async function semanticSearch(query:string, options = {}) {
  const {
    limit = 5,
    similarityThreshold = 0.7,
    includeContent = true
  }: any = options;
  
  try {
    // Create embedding for the search query
    const queryEmbedding = await createEmbedding(query);
    const queryVector = `[${queryEmbedding.join(',')}]`;
    
    // Build the SQL query
    let sql = `
      SELECT 
        filename,
        ${includeContent ? 'content,' : ''}
        1 - (embedding_1 <=> $1::vector) as similarity,
        chunk_index
      FROM documents
      WHERE 1 - (embedding_1 <=> $1::vector) > $2
    `;
    
    const params = [queryVector, similarityThreshold];
    let paramCount = 3;
    
   
    // Add ordering and limit
    sql += `
      ORDER BY similarity DESC
      LIMIT $${paramCount}
    `;
    params.push(limit);
    
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Error in semantic search:', error);
    throw error;
  }
}


export async function main() {
  const folderPath = process.env.DOCUMENTS_FOLDER;
  
  try {
    // Setup database
    
    //await setupDatabase();
    
    // Get all files in the folder
    const files = await readdir(folderPath || '');
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(folderPath || '', file);
      await processFile(filePath);
    }
    
    console.log('Processing complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    //await pool.end();
  }
}
