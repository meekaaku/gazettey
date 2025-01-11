import { extractAndSaveAllFiles, saveFirstPageToPdf } from '$lib/gazzete';
import { POSTGRES_PASSWORD } from '$env/static/private';

export const prerender = false;

export async function POST() {
  //await extractAndSaveAllFiles();
  await saveFirstPageToPdf();




  return new Response('OK');
};
