import Typesense from 'typesense';
import fs  from 'fs';
import  { pool } from './gazzete';
import dotenv from 'dotenv';

dotenv.config();

const tss = new Typesense.Client({
    'nodes': [{
        'host': process.env.TYPESENSE_HOST || 'localhost',
        'port': Number(process.env.TYPESENSE_PORT) || 3000,      // For Typesense Cloud use 443
        'protocol': 'https',   // For Typesense Cloud use https
        'path': process.env.TYPESENSE_PATH || ''
    }],
    'apiKey': process.env.TYPESENSE_ADMIN_KEY || '',
    'connectionTimeoutSeconds': 2
});

console.log({
    'host': process.env.TYPESENSE_HOST,
    'port': process.env.TYPESENSE_PORT,
    'path': process.env.TYPESENSE_PATH,
    'apiKey': process.env.TYPESENSE_ADMIN_KEY,
})

function log(message: string) {
    console.log(message);
}

export function readJSON(filePath: string): any {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    try {
        const jsonData = JSON.parse(fileContent);
        return jsonData;
    } catch (error) {
        // Handle the error here
        console.error('Error parsing JSON:', error);
        return null;
    }
}

export async function buildIndex()
{

    const report = [];

    // First time run stuff
    if(false){
        try {
            const a = await tss.collections('gazette-a').retrieve();
        } catch(e) {
            await tss.collections().create(await readJSON('src/lib/gazette-schema.json'));
            //await tss.aliases().upsert('gazette', {'collection_name': 'gazette-a'});
        }
        try {
            const b = await tss.collections('gazette-b').retrieve();
        } catch(e) {
            await tss.collections().create(await readJSON('src/lib/gazette-schema.json'));
        }
    }


    let t0 = performance.now();

    report.push(log(`[ ${ new Date().toISOString().substring(0,19)} ] Started indexing`));

    let alias, old_collection, new_collection = 'gazette-a';
    try 
    {
        alias = await tss.aliases('gazette').retrieve()
        old_collection = alias.collection_name;
        new_collection = old_collection  === 'gazette-a' ? 'gazette-b' : 'gazette-a';
    }
    catch(error){}


    const collection = await readJSON('src/lib/gazette-schema.json');
    collection.name = new_collection;
    let response;
    try {
        response = await tss.collections(collection.name).delete();
    } catch(e) {
    }
    response = await tss.collections().create(collection);
    let t1 = performance.now();
    report.push(log(`[ ${Math.round(t1 - t0)}ms ] Created collection ${collection.name}`));





    const offsets = [0, 100, 200];
    try {
        
        for(const offset of offsets){
            t0 = performance.now();
            const documents = (await pool.query(`SELECT id, filename, file_url, content, link_url FROM documents LIMIT 100 OFFSET ${offset} `)).rows;
            t1 = performance.now();
            report.push(log(`[ ${Math.round(t1 - t0)}ms ] Retrieved ${documents.length} documents from database`));

            response = await tss.collections(collection.name).documents().import(documents, {action: 'create'})
            report.push(log(`[ ${Math.round(t1 - t0)}ms ] Added ${documents.length} documents to ${collection.name}`));
        }
    }
    catch(error: any) {
        console.error(`Error indexing: `, error);
    }


    console.log('Setting alias gazette to ', new_collection);
    //await tss.collections('gazette').delete();
    await tss.aliases().upsert('gazette', {'collection_name': new_collection});

    report.push(log(`[ ${ new Date().toISOString().substring(0,19)} ] Finished indexing ${collection.name}`));

    return

}


export async function search(q: string) {
    const searchParams = {  
        q: q,
        query_by: 'content',
        index: 'gazette'
    }
    const results = await tss.collections('gazette').documents().search(searchParams);
    return results;
}