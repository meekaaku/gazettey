<script lang="ts">
    import ThaanaInput from '$lib/ThaanaInput.svelte';
    import { onMount } from 'svelte';


    let thaanaValue = $state('');
    let tsResult = $state<any|null>({});
    let busy = $state(false);


    async function handleSearch(event: any) {
        event.preventDefault();
        try {
            tsResult = null;
            busy = true;
            const response = await fetch(`/api/search`, {method: 'POST', body: JSON.stringify({q: thaanaValue})});
            tsResult = await response.json();
            busy = false;
            console.log(tsResult);
        }
        catch(error: any){
            busy = false;
            console.error(error);
        }

    }

    function latinToThaana(input: string) {
        
        // Mapping of ASCII characters to Thaana Unicode
        const thaanaMap: Record<string, string> = {
            // Consonants
            'h': '\u0780', // ހ
            'S': '\u0781', // ށ
            'n': '\u0782', // ނ
            'r': '\u0783', // ރ
            'b': '\u0784', // ބ
            'L': '\u0785', // ޅ
            'k': '\u0786', // ކ
            'w': '\u0787', // އ
            'v': '\u0788', // ވ
            'm': '\u0789', // މ
            'f': '\u078A', // ފ
            'd': '\u078B', // ދ
            't': '\u078C', // ތ
            'l': '\u078D', // ލ
            'g': '\u078E', // ގ
            'N': '\u078F', // ޏ
            's': '\u0790', // ސ
            'D': '\u0791', // ޑ
            'z': '\u0792', // ޒ
            'T': '\u0793', // ޓ
            'y': '\u0794', // ޔ
            'p': '\u0795', // ޕ
            'j': '\u0796', // ޖ
            'c': '\u0797', // ޗ
            
            // Vowels (Fili)
            'a': '\u07A6', // ަ
            'A': '\u07A7', // ާ
            'i': '\u07A8', // ި
            'I': '\u07A9', // ީ
            'u': '\u07AA', // ު
            'U': '\u07AB', // ޫ
            'e': '\u07AC', // ެ
            'E': '\u07AD', // ޭ
            'o': '\u07AE', // ޮ
            'O': '\u07AF', // ޯ
            'q': '\u07B0', // ް (Sukun)
            
            // Common punctuation
            '.': '.',
            ',': '،',
            ';': '؛',
            '?': '؟'
        };

        // Convert string character by character
        let result = '';
        for (let char of input) {
            result += thaanaMap[char] || char;
        }
        return result;
    }

    function handleKeyInput(event: any) {
        const input = event.data;
        const _thaanaValue = thaanaValue;
        thaanaValue = latinToThaana(thaanaValue);
    }


    
    function handleChange(event: any) {
        console.log('Thaana text:', event.detail.value);
        //thaanaValue = event.detail.value;
    }
</script>


<div class="container mt-4">
  <div class="row justify-content-center">
  <h1 class="text-center">ގެޒެޓޭ</h1>
  </div>
  <!-- Search Section -->

  <div class="row justify-content-center mb-4 sticky-top pt-4">
    <div class="col-12 col-md-8 col-lg-6">
        <form onsubmit={handleSearch}>
      <div class="input-group">
        <button 
          class="btn btn-primary btn-lg" 
          type="submit"
          onclick={handleSearch}
        >
        ހޯދާ
        </button>       


        <input 
          type="search" 
          class="form-control form-control-lg" 
          placeholder="ހޯދާލަދީބަލަ..."
          autocorrect="off"
          autocapitalize="off"
          bind:value={thaanaValue}
          oninput={handleKeyInput}
          dir="rtl"
        >
      </div>
        </form>
    </div>
  </div>
  <!-- Results Section -->
  <div class="row justify-content-center">
    <div class="col-12 col-md-12">
      {#if busy}
        <div class="text-center text-muted">
          <div class="spinner-border text-primary" role="status"></div>
            <p>ހޯދަނީ</p>
        </div>
      {/if}

      {#if tsResult && tsResult.found > 0}

        <div class="text-center text-muted">
          <p style="text-direction: rtl;">
            ގެޒެޓް ފެނުނު އަދަދު {tsResult.found}
           ތިރީގައި މިވަނީ {tsResult.hits.length} </p>
        </div>


            <div class="row">
                {#each tsResult.hits as hit}
                <div class="col-12 col-sm-6 col-md-4 col-xl-3 outer">
                    <div class="inner shadow">
                    <a href={`/view?id=${hit.document.id}`} target="_blank">
                    <img src={`https://haley.sgp1.cdn.digitaloceanspaces.com/gazettey/${hit.document.filename.replace('.pdf','_1.jpg')}`} class="img-fluid" alt="Gazzete">
                    </a>
                    </div>
                </div>

                {/each}
            </div>
      {:else if tsResult && tsResult.found == 0}
        <div class="text-center text-muted">
          <p>އެއްވެސް ނަތީޖާއެް ނުފެނުނު</p>
        </div>
      {/if}
    </div>
  </div>
</div>


<style>
    .outer {
        padding: 10px;
    }
    .inner{
        border: 1px solid #ccc;
    }

.outer {
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.outer:hover {
    transform: scale(1.1); /* Raises the image */
    z-index: 1000;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Adds a shadow effect */
}

.inner {
    transition: transform 0.3s ease;
}

.outer:hover .inner {
    transform: scale(1.05); /* Slightly enlarge the inner content on hover */
}

</style>