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

type ProcessChunkResult = {
    content_en: string | null;
    summary_en: string | null;
    summary_dv: string | null;
}

export async function processChunk(chunk:string, output: 'content_en' | 'summary_en' | 'summary_dv') : Promise<string>
{

    let prompt = '';
    if(output === 'content_en'){
        prompt = `Please translate to English. No additional text description or comments. : \n\n`;
    }
    else if(output === 'summary_en'){
        prompt = `Please summarise in English. No additional text description or comments. : \n\n`;
    }
    else if(output === 'summary_dv'){
        prompt = `Please summarise in dhivehi. . No additional text description or comments. : \n\n`;
    }
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
                content: `${prompt}${chunk}`
            }],
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
    
}
