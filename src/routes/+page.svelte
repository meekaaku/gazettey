<script lang="ts">

let query = '';

async function run() {
    const response = await fetch('/api/embed', {method: 'POST'});
}

async function search() {
    const response = await fetch(`/api/search`, {method: 'POST', body: JSON.stringify({q: query})});
    const data = await response.json();
    console.log(data);
}

</script>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<button onclick={run}>Process Files</button>



<input type="text" bind:value={query} />
<button onclick={search}>Search</button>