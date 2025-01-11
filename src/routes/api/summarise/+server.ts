import { json, error } from '@sveltejs/kit';
import { processChunk, splitIntoChunks } from '$lib/ai';
import { pool } from '$lib/gazzete';

export const prerender = false;

export async function POST({ url, request }) {

    try {

        const dbresult = await pool.query('SELECT * FROM documents WHERE content_en IS NULL LIMIT 3');

        for (const row of dbresult.rows) {
            // Split content into chunks
            const chunks = splitIntoChunks(row.content);
            const content_en = [];
            const summary_en = [];
            const summary_dv = [];

            // Process each chunk
            let i = 1;
            for (const chunk of chunks) {
                try {
                    content_en.push(await processChunk(chunk, 'content_en'));
                    summary_en.push(await processChunk(chunk, 'summary_en'));
                    summary_dv.push(await processChunk(chunk, 'summary_dv'));
                    console.log(`Processed ${row.id}, chunk ${i} of ${chunks.length}`);
                    i++;
                }
                catch(e) {
                    console.error(`Error processing chunk ${i}:`, e);
                }
            }

            // Combine results
            const combinedContentEn = content_en.join(' ');
            const combinedSummaryEn = summary_en.join(' ');
            const combinedSummaryDv = summary_dv.join(' ');

            // If there were multiple chunks, generate a final summary
            let finalSummaryEn = combinedSummaryEn;
            let finalSummaryDv = combinedSummaryDv;
            let finalContentEn = combinedContentEn;
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
            await pool.query('UPDATE documents SET content_en = $1, summary_en = $2, summary_dv = $3 WHERE id = $4', [finalContentEn, finalSummaryEn, finalSummaryDv, row.id]);
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
