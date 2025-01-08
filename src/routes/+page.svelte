<script lang="ts">

async function run() {
    const response = await fetch('/api/embed', {method: 'POST'});
}

</script>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<button onclick={run}>Run</button>
