import { error } from '@sveltejs/kit';
import pkg from 'pg';
//import { pool } from '$lib/gazzete';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
export async function load({ fetch, url }: any) {


    const pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        ssl: {
            rejectUnauthorized: false
        }
    });
    const dbresult = await pool.query('SELECT 1+1 as answer');
    const answer = dbresult.rows[0].answer;
    return {message: 'Hello World', answer: answer}

    const id = url.searchParams.get('id');
    if(!id){
      return error(404, 'Document not found');
    }
    try {
      if(dbresult.rows.length > 0){
          const pdfUrl = dbresult.rows[0].file_url;
          const response = await fetch(pdfUrl);
          if(response.ok){
              const pdfBlob = await response.blob();
              const pdfBase64 = Buffer.from(await pdfBlob.arrayBuffer()).toString('base64');
              return {
                  pdfData: `data:application/pdf;base64,${pdfBase64}`,
                  pdfUrl: pdfUrl,
                  id: id
              };
          }
      }
    }
    catch (error: any) {
      return error(404, JSON.stringify(error));
    }
    /*
    const pdfUrl = url.searchParams.get('file');
    const response = await fetch(pdfUrl);
    if(response.ok){
        const pdfBlob = await response.blob();
        const pdfBase64 = Buffer.from(await pdfBlob.arrayBuffer()).toString('base64');
        return {
            pdfData: `data:application/pdf;base64,${pdfBase64}`
        };
    }
    return {
        pdfData: null
    };
    */
}