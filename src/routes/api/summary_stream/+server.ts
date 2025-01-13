import { json, error } from '@sveltejs/kit';
import { processChunk, splitIntoChunks } from '$lib/ai';
import { pool } from '$lib/gazzete';
import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config()

export const prerender = false;

const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});


export async function GET({ url, request }) {

    try {

        const id = url.searchParams.get('id');
        const task = url.searchParams.get('task') || '';

        if(!id  ){
            return json({message: 'Invalid id'}, {status: 400});
        }

        if(!['summary_en', 'summary_dv', 'content_en'].includes(task)){
            return json({message: 'Invalid task'}, {status: 400});
        }

        const dbresult = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
        if(dbresult.rows.length == 0){
            return json({message: 'Document not found'}, {status: 404});
        }

        const row = dbresult.rows[0];


        if(row[task]){
            const obj:any = {}
            obj[task] = row[task];
            console.log(`${task} already exists, so retreiving from db`);
            return json(obj, {status: 200});
        }

        // Call the function to handle chunking, streaming, and saving to the database
        const response = await handleStreamingChunks(id, row.content);

        return new Response(JSON.stringify({ response }), {
            headers: {
            'Content-Type': 'application/json',
            },
        });

    } catch (error: any) {
        console.error('Error processing content:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to process content',
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

};



async function handleStreamingChunks(id: string, content:string) {
  const chunks = splitIntoChunks(content);
  let fullResponse = "";

  for (let chunk of chunks) {
    const stream = await client.messages.create({
      model: 'claude-3-5-sonnet-latest', // or whatever version you're using
      messages: [{ role: 'user', content: `Please summarise in dhivehi. . No additional text description or comments. : \n\n` + chunk}],
      stream: true,
      max_tokens: 1024
    });

    // Get the response from the stream
    const reader = stream.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let streamData = '';


    for await (const messageChunk of stream) {
        if (messageChunk.type === 'content_block_delta') {
            fullResponse += messageChunk.delta.text;
        }
    }
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      streamData += decoder.decode(value, { stream: true });

      // Yield the stream data progressively
      fullResponse += streamData;
    }
  }

    await pool.query(`UPDATE documents SET summary_dv = $2 WHERE id = $1`, [id, fullResponse]);
  return fullResponse;
}


