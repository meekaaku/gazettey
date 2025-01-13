<script lang="ts">
    import { page } from '$app/state';
    let { data }: { data: any } = $props();

    let currentTab = $state('pdf');
    let pdfDoc: any;
    let currentPage = 1;

    let summary_dv: string|null = $state(data.summary_dv);
    let busy = $state(false);



    async function getAiHelp(task: string) {
    
        try {
            busy = true;
            const response = await fetch(`/api/summary_stream?id=${data.id}&task=summary_dv`);
            
            const { response: fullResponse } = await response.json();
            summary_dv = fullResponse.replaceAll('\n', '<br>');

            busy = false;
        }
        catch (error: any) {
            busy = false;
        }
    }


</script>


{#if data.pdfData}
 

<embed src={data.pdfData} width="100%" height="800px" type="application/pdf" style="display: none;">

<ul class="nav nav-tabs">
  <li class="nav-item">
    <a class="nav-link"  class:active={currentTab == 'pdf'} aria-current="page" href="#" onclick={() => currentTab = 'pdf'}>ޕީޑީއެފް</a>
  </li>
  <li class="nav-item active">
    <a class="nav-link"  class:active={currentTab == 'summary_dv'} href="#" onclick={() => currentTab = 'summary_dv'}>އޭ އައި ޚުލާސާ</a>
  </li>

</ul>


{#if currentTab == 'pdf'}
<div 
	 class="show active tab-pane fade" id="pdf-tab-pane" role="tabpanel" aria-labelledby="pdf-tab" tabindex="0" style="height: 100vh">
    {#if data.pdfData}
    <!-- <iframe src={data.pdfData} width="100%" height="100%" frameborder="0"></iframe> -->
    <object 
    data={data.pdfData} 
    type="application/pdf" 
    width="100%" 
    height="100%">

        <div class="text-center" style="padding-top: 100px;">
            <p><a href={data.pdfUrl} target="_blank">ޕީޑީއެފް ފައިލް ޑައުންލޯޑް ކުރައްވާ</a></p>
        </div>
    </object>


    {/if}
</div>
{/if}

{#if currentTab == 'summary_dv'}
<div class="show active tab-pane fade" id="pdf-tab-pane" role="tabpanel" aria-labelledby="pdf-tab" tabindex="0" style="height: 100vh">
    {#if summary_dv}
    <div class="text-center px-3 py-3">

        <p style="text-direction: rtl; text-align: right;">{@html summary_dv}</p>
    </div>
    {:else}
    <div class="text-center px-3" style="padding-top: 100px;">
      {#if busy}
        <div class="text-center text-muted">
          <div class="spinner-border text-primary" role="status"></div>
          <p>އޭ އައި ޚުލާސާ ތައްޔާރު ކުރަނީ</p>

        </div>


      {:else}
     މިއީ އޭއައި އިން ތައްޔާރު ކުރާ ލިޔުމެއް ކަމުން ކުށް ހުރުމަކީ އެކަށީގެން ވާކަމެއް. .އޭއައި ޚުލާސާ އެއް ހޯއަދަވަން ތިރީގައި މިވާ ތަނައް ފިތާލާ 
       <br /> 
       <br /> 
       <button class="btn btn-primary" onclick={() => getAiHelp('summary_dv')}>އޭ އައި ޚުލާސާ ތައްޔާރު ކުރޭ</button>
      {/if}


    </div>
    {/if}
</div>

{/if}







{:else}
    <div>
        <h1>No file specified</h1>
    </div>
{/if}


<style>
    #pdf-container {
      overflow-y: auto;
      height: 100vh;
      width: 100%;
      border: 1px solid #000;
    }
    .pdf-page {
      margin-bottom: 10px;
    }
    canvas {
      width: 100%;
    }

</style>