import Typesense from 'typesense';
import fs  from 'fs';
import  { pool } from './gazzete';
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

async function  buildIndex()
{

    const report = [];
    let t0 = performance.now();
    report.push(log(`[ ${ new Date().toISOString().substring(0,19)} ] Started indexing`));

    let alias, old_collection, new_collection = 'gazette-a';
    try 
    {
        alias = await tss.aliases('gazette-a').retrieve()
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



    const privateKey = process.env.JWT_SECRET;
    if(!privateKey) throw new Error('JWT_SECRET is not set');


    t0 = performance.now();
    const documents = (await pool.query('SELECT id, filename, file_url, content, link_url FROM documents LIMIT 10')).rows;
    t1 = performance.now();
    report.push(log(`[ ${Math.round(t1 - t0)}ms ] Retrieved ${documents.length} documents from database`));



    t0 = performance.now();
    try {
        response = await tss.collections(collection.name).documents().import(documents, {action: 'create'})
    }
    catch(error: any) {
        error.importResults.forEach((result: any, index: number) => {
            if (result.success === false) {
                console.error(`Error indexing: ${result.error} - ${result.document.sku}`);
                console.error(`Document: ${JSON.stringify(documents[index])}`);
            }
        });
    }

    await tss.aliases().upsert('index-2', {'collection_name': new_collection});

    t1 = performance.now();
    log(`[ ${Math.round(t1 - t0)}ms ] Imported ${documents.length} documents into ${collection.name}`);


    report.push(log(`[ ${ new Date().toISOString().substring(0,19)} ] Finished indexing`));


    return

}