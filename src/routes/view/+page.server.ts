export async function load({ fetch, url }: any) {
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
}