import { json, error } from '@sveltejs/kit';
import { search } from '$lib/typesense';

export const prerender = false;

export async function POST({ url, request }) {
    //const q = url.searchParams.get('q') ?? null;
    const body = await request.json();
    const q = body.q ?? null;

    if (!q) {
        return json({message: 'Query is required', status: 400 });
    }

    console.log('querying for ', q)

    
    const results = await search(q);

    return json(results);

};
