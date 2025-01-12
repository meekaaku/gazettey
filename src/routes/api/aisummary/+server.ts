import { json, error } from '@sveltejs/kit';
import { processChunk, splitIntoChunks } from '$lib/ai';
import { pool } from '$lib/gazzete';

export const prerender = false;

export async function GET({ url, request }) {

    try {

        const id = url.searchParams.get('id');
        const task = url.searchParams.get('task') || '';

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

        for (const row of dbresult.rows) {
            // Split content into chunks
            const chunks = splitIntoChunks(row.content);
            const results= [];

            // Process each chunk
            let i = 1;
            for (const chunk of chunks) {
                try {
                    results.push(await processChunk(chunk, task as any));
                }
                catch(e) {
                    console.error(`Error processing chunk ${i}:`, e);
                }
            }

            // Combine results
            const combined = results.join(' ');

            /*
            if (chunks.length > 1) {
                const summaryResponse = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.CLAUDE_API_KEY,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        messages: [{
                            role: 'user',
                            content: `Please provide a concise, coherent summary of these combined summaries: ${combinedSummary}`
                        }],
                        model: 'claude-3-sonnet-20240229',
                        max_tokens: 512
                    })
                });

                if (summaryResponse.ok) {
                    const summaryData = await summaryResponse.json();
                    finalSummary = summaryData.content[0].text;
                }
            }

            return new Response(JSON.stringify({
                translation: combinedTranslation,
                summary: finalSummary,
                chunkCount: chunks.length
            }), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            */
            await pool.query(`UPDATE documents SET ${task} = $2 WHERE id = $1`, [id, combined]);
            const obj:any = {}
            obj[task] = combined;
            return json(obj, {status: 200});
        }
        return json({message: 'Content summarised', status: 200});
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
