<script lang="ts">
    import { page } from '$app/state';
    let { data }: { data: any } = $props();

    let currentTab = $state('pdf');
    let pdfDoc: any;
    let currentPage = 1;


    async function loadPdf() {
        currentTab = 'canvas';
        pdfjsLib.getDocument(data.pdfData).promise.then(function(pdf: any) {
            pdfDoc = pdf;
            renderPage(currentPage);  // Initially render the first page

            const pdfContainer = document.getElementById('pdf-container');
            pdfContainer?.addEventListener('scroll', onScroll);

            /*
            const canvas:HTMLCanvasElement|null = document.getElementById('pdf-canvas');
            if (!canvas) return;
            const context = canvas.getContext('2d');

            const viewport = page.getViewport({ scale: 1.0 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render the page
            page.render({
                canvasContext: context,
                viewport: viewport
            });
            });
            */
        });
    }

      function renderPage(pageNum: number) {
        pdfDoc.getPage(pageNum).then(function(page: any) {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const viewport = page.getViewport({ scale: 1.5 });

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Append the canvas to the container
          document.getElementById('pdf-container')?.appendChild(canvas);

          // Render the page
          page.render({
            canvasContext: context,
            viewport: viewport
          });
        });
      }

      // Handle scrolling to load next pages dynamically
      function onScroll() {
        const container = document.getElementById('pdf-container');
        if (!container) return;
        const containerHeight = container.clientHeight;
        const scrollTop = container.scrollTop;
        const totalHeight = container.scrollHeight;

        // Load next page when the user scrolls near the bottom
        if (scrollTop + containerHeight >= totalHeight - 100) {
          if (currentPage < pdfDoc.numPages) {
            currentPage++;
            renderPage(currentPage);
          }
        }

        // Load previous page if the user scrolls to the top
        if (scrollTop <= 100 && currentPage > 1) {
          currentPage--;
          renderPage(currentPage);
        }
      }



</script>


<h1>{currentTab}</h1>
{#if data.pdfData}
    <object 
    data={data.pdfData} 
    type="application/pdf" 
    width="100%" 
    height="800px" style="display: none;">
    <p>Unable to display PDF</p>
    </object>

<embed src={data.pdfData} width="100%" height="800px" type="application/pdf" style="display: none;">

<ul class="nav nav-tabs">
  <li class="nav-item">
    <a class="nav-link"  class:active={currentTab == 'pdf'} aria-current="page" href="#" onclick={() => currentTab = 'pdf'}>PDF</a>
  </li>
  <li class="nav-item active">
    <a class="nav-link"  class:active={currentTab == 'canvas'} href="#" onclick={loadPdf}>Canvas</a>
  </li>

</ul>


{#if currentTab == 'pdf'}
<div 
	 class="show active tab-pane fade" id="pdf-tab-pane" role="tabpanel" aria-labelledby="pdf-tab" tabindex="0" style="height: 100vh">
    {#if data.pdfData}
    <iframe src={data.pdfData} width="100%" height="100%" frameborder="0"></iframe>
    {/if}
</div>
{/if}

{#if currentTab == 'canvas'}
<div class="show active tab-pane fade" id="pdf-tab-pane" role="tabpanel" aria-labelledby="pdf-tab" tabindex="0" style="height: 100vh">
     <div id="pdf-container"></div>
</div>
{/if}







{:else}
    <div>
        <h1>No file specified</h1>
    </div>
{/if}
