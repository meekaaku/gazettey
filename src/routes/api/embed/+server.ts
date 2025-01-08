import { main } from '$lib/script';
import { POSTGRES_PASSWORD } from '$env/static/private';

export const prerender = false;

export async function POST() {
  await main();
  return new Response('OK');
};
