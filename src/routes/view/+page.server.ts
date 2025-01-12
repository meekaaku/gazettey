import { pool } from '$lib/gazzete';

export async function load({ fetch, url }: any) {

    const id = url.searchParams.get('id');
    if(id){
      const dbresult = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
      if(dbresult.rows.length > 0){
        const pdfUrl = dbresult.rows[0].file_url;
        const response = await fetch(pdfUrl);
        if(response.ok){
            const pdfBlob = await response.blob();
            const pdfBase64 = Buffer.from(await pdfBlob.arrayBuffer()).toString('base64');
            return {
                pdfData: `data:application/pdf;base64,${pdfBase64}`
            };
        }
      }
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