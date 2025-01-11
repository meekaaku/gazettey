// ThaanaInput.svelte
<script lang="ts">
    import { onMount } from 'svelte';
    
    export let value = '';
    export let placeholder = '';
    
    let inputElement: any;
    let displayValue = '';
    let selectionStart = 0;
    let selectionEnd = 0;
    
    // Thaana conversion map (same as before)
    const thaanaMap: Record<string, string> = {
        'h': '\u0780', 'S': '\u0781', 'n': '\u0782', 'r': '\u0783',
        'b': '\u0784', 'L': '\u0785', 'k': '\u0786', 'w': '\u0787',
        'v': '\u0788', 'm': '\u0789', 'f': '\u078A', 'd': '\u078B',
        't': '\u078C', 'l': '\u078D', 'g': '\u078E', 'N': '\u078F',
        's': '\u0790', 'D': '\u0791', 'z': '\u0792', 'T': '\u0793',
        'y': '\u0794', 'p': '\u0795', 'j': '\u0796', 'c': '\u0797',
        'a': '\u07A6', 'A': '\u07A7', 'i': '\u07A8', 'I': '\u07A9',
        'u': '\u07AA', 'U': '\u07AB', 'e': '\u07AC', 'E': '\u07AD',
        'o': '\u07AE', 'O': '\u07AF', 'q': '\u07B0',
        '.': '.', ',': '،', ';': '؛', '?': '؟'
    };

    // Convert Latin to Thaana
    function convertToThaana(input: string) {
        return input.split('').map((char: string) => thaanaMap[char] || char).join('');
    }

    // Convert Thaana to Latin (for maintaining the input value)
    function convertToLatin(input: string) {
        const reverseMap = Object.fromEntries(
            Object.entries(thaanaMap).map(([k, v]) => [v, k])
        );
        return input.split('').map((char: string) => reverseMap[char] || char).join('');
    }

    // Handle input changes
    function handleInput(event: any) {
        const input = event.target;
        const newValue = input.value;
        
        // Store cursor position
        selectionStart = input.selectionStart;
        selectionEnd = input.selectionEnd;
        
        // Update the internal value (Latin)
        value = newValue;
        
        // Update the display value (Thaana)
        displayValue = convertToThaana(newValue);
        
        // Dispatch change event
        const changeEvent = new CustomEvent('change', {
            detail: { value: displayValue }
        });
        input.dispatchEvent(changeEvent);
    }

    // Handle key events
    function handleKeyDown(event: any) {
        // Allow normal operation of special keys
        if (event.key === 'Backspace' || 
            event.key === 'Delete' || 
            event.key === 'ArrowLeft' || 
            event.key === 'ArrowRight' ||
            event.key === 'Home' ||
            event.key === 'End' ||
            (event.ctrlKey && (event.key === 'c' || event.key === 'v' || event.key === 'x'))) {
            return;
        }
    }

    // Handle paste events
    function handlePaste(event: any) {
        event.preventDefault();
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');
        const convertedText = convertToLatin(pastedText);
        
        // Insert at cursor position
        const start = event.target.selectionStart;
        const end = event.target.selectionEnd;
        const currentValue = value;
        
        value = currentValue.substring(0, start) + 
                convertedText + 
                currentValue.substring(end);
                
        // Update cursor position
        setTimeout(() => {
            const newPosition = start + convertedText.length;
            event.target.setSelectionRange(newPosition, newPosition);
        }, 0);
    }

    // Update selection tracking
    function handleSelect(event: any) {
        selectionStart = event.target.selectionStart;
        selectionEnd = event.target.selectionEnd;
    }

    onMount(() => {
        if (inputElement) {
            // Initialize with any default value
            displayValue = convertToThaana(value);
        }
    });
</script>

<div class="thaana-input-container" dir="rtl">
    <input
        bind:this={inputElement}
        type="text"
        {placeholder}
        value={value}
        on:input={handleInput}
        on:keydown={handleKeyDown}
        on:paste={handlePaste}
        on:select={handleSelect}
        class="thaana-input"
    />
    <div class="thaana-display" aria-hidden="true">
        {displayValue || placeholder}
    </div>
</div>

<style>
    .thaana-input-container {
        position: relative;
        width: 100%;
    }

    .thaana-input {
        width: 100%;
        padding: 8px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: transparent;
        color: transparent;
        caret-color: black;
    }

    .thaana-display {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 8px;
        font-size: 16px;
        pointer-events: none;
        white-space: pre;
        overflow: hidden;
    }
</style>