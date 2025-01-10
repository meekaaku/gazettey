import { buildIndex } from '$lib/typesense';

export const prerender = false;

export async function POST() {
  await buildIndex();

  return new Response('OK');
};
