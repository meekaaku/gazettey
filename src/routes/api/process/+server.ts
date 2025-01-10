import { extractAndSaveAllFiles} from '$lib/gazzete';
import { POSTGRES_PASSWORD } from '$env/static/private';

export const prerender = false;

export async function POST() {
  await extractAndSaveAllFiles();




  return new Response('OK');
};
