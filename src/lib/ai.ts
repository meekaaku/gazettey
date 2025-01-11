import  { pool } from './gazzete';
import dotenv from 'dotenv';


dotenv.config();

export function splitIntoChunks(content: string, maxChunkSize = 10000) {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkSize) {
            chunks.push(currentChunk);
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}


export async function processChunk(chunk:string, targetLanguage:string) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            messages: [{
                role: 'user',
                content: `Please translate to English. Summarise in dhivehi and summarise in English. Return the response in JSON format with 'content_en'', 'summary_en', 'summary_dv': \n\n${chunk}`
            }],
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    try {
        // Parse the JSON response from Claude
        const parsedResponse = JSON.parse(data.content[0].text);
        return parsedResponse;
    } catch (e) {
        console.error('Failed to parse Claude response:', e);
        return {
            translation: data.content[0].text,
            summary: 'Failed to parse summary'
        };
    }
}
