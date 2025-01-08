// Install required packages:
// bun add @xenova/transformers pg pdf-parse dotenv

import { pipeline } from '@xenova/transformers';
import { Pool } from 'pg';
import * as pdfParse from 'pdf-parse';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Initialize the embedding pipeline
let embedder:any = null;

async function initializeEmbedder() {
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
}

async function createEmbedding(text:string) {
  if (!embedder) await initializeEmbedder();
  
  const output = await embedder(text, {
    pooling: 'mean',
    normalize: true,
  });
  
  return Array.from(output.data);
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
    
    // Store in database
    await pool.query(
      `INSERT INTO documents (filename, content, embedding, language)
       VALUES ($1, $2, $3, $4)`,
      [filename, content, embedding, language]
    );
    
    console.log(`Processed ${filename} (${language})`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function main() {
  const folderPath = process.env.DOCUMENTS_FOLDER;
  
  try {
    // Setup database
    await setupDatabase();
    
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
    await pool.end();
  }
}

main();