<script lang="ts">
    import { page } from '$app/state';
    export let data: any;
</script>

{#if data.pdfData}
    <object 
    data={data.pdfData} 
    type="application/pdf" 
    width="100%" 
    height="800px" style="display: none;">
    <p>Unable to display PDF</p>
    </object>

<embed src={data.pdfData} width="100%" height="800px" type="application/pdf" style="display: none;">
    <iframe src={data.pdfData} width="100%" height="600px" frameborder="0"></iframe>

{:else}
    <div>
        <h1>No file specified</h1>
    </div>
{/if}
