<script lang="ts">
    import { page } from '$app/state';
    export let data: any;
</script>

{#if data.pdfData}
    <object 
    data={data.pdfData} 
    type="application/pdf" 
    width="100%" 
    height="800px">
    <p>Unable to display PDF</p>
    </object>
{:else}
    <div>
        <h1>No file specified</h1>
    </div>
{/if}
