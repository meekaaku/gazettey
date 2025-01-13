import { error } from '@sveltejs/kit';
import { pool } from '$lib/gazzete';

export async function load({ fetch, url }: any) {

    const id = url.searchParams.get('id');
    if(!id){
      return error(404, 'Document not found');
    }
    try {
      const dbresult = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
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