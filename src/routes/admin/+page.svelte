<script lang="ts">

let query = '';

async function process() {
    const response = await fetch('/api/process', {method: 'POST'});
}

async function buildIndex() {
    const response = await fetch('/api/build_index', {method: 'POST'});
}

async function summarise() {
    const response = await fetch('/api/summarise', {method: 'POST'});
}

async function search() {
    const response = await fetch(`/api/search`, {method: 'POST', body: JSON.stringify({q: query})});
    const data = await response.json();
    console.log(data);
}

</script>
<h1>Gazettey Admin</h1>
<button onclick={process}>Process Files</button> <br />
<button onclick={buildIndex}>Build Index</button> <br />
<button onclick={summarise}>Summarise</button> <br />



<input type="text" bind:value={query} dir="rtl" />
<button onclick={search}>Search</button>