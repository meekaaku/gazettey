<script lang="ts">
    import ThaanaInput from '$lib/ThaanaInput.svelte';
    import { onMount } from 'svelte';


    let thaanaValue = $state('');
    let searchResults = $state([]);


    async function handleSearch() {
        try {
            const response = await fetch(`/api/search`, {method: 'POST', body: JSON.stringify({q: thaanaValue})});
            const typsenseResults = await response.json();
            console.log(typsenseResults);
        }
        catch(error: any){
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
        console.log({_thaanaValue,thaanaValue});
    }


    
    function handleChange(event: any) {
        console.log('Thaana text:', event.detail.value);
        //thaanaValue = event.detail.value;
    }
</script>


<div class="container mt-4">
  <!-- Search Section -->
  <div class="row justify-content-center mb-4">
    <div class="col-12 col-md-8 col-lg-6">
      <div class="input-group">
        <input 
          type="text" 
          class="form-control form-control-lg" 
          placeholder="Search..."
          bind:value={thaanaValue}
          oninput={handleKeyInput}
          dir="rtl"
        >
        <button 
          class="btn btn-primary btn-lg" 
          type="button"
          onclick={handleSearch}
        >
          Search
        </button>
      </div>
    </div>
  </div>
  <!-- Results Section -->
  <div class="row justify-content-center">
    <div class="col-12 col-md-8">
      {#if searchResults.length > 0}
        <div class="list-group">
          {#each searchResults as result}
            <div class="list-group-item">
              <h5 class="mb-1">{result.title}</h5>
              <p class="mb-1">{result.description}</p>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center text-muted">
          <p>No results to display. Try searching for something!</p>
        </div>
      {/if}
    </div>
  </div>
</div>