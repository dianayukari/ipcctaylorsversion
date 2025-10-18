<script>
import { onMount } from 'svelte';
import { slide } from 'svelte/transition';
import { base } from '$app/paths';

    let tayToIpcc = [];
    let ipccToTay = [];
    let ipccToGreta = [];
    let gretaToIpcc = [];

    let songTitles = [];
    let chapterTitles = [];
    let speechTitles = [];

    let selectedSong = null;
    let selectedChapter = null;
    let selectedSpeech = null;
    
    let expandedItems = new Set();
    let selectedSource = 'taylor';
    let selectedTarget = 'ipcc';

    $: selectedSourceLabel = selectedSource=='taylor' ? 'Taylor Swift' : 'IPCC';
    $: selectedTargetLabel = selectedTarget=='taylor' ? 'Taylor Swift' : 'IPCC';

    const options = [
        { value: 'ipcc', label: 'IPCC' },
        { value: 'greta', label: 'Greta Thunberg' },
        { value: 'taylor', label: 'Taylor Swift' }
    ];

    // computed values
    $: transformationKey = `${selectedSource}-to-${selectedTarget}`;
    $: currentData = getDataForTransformation(transformationKey, tayToIpcc);
    $: currentOptions = getCurrentOptions(selectedSource, transformationKey, songTitles);
    $: currentSelection = getCurrentSelection(selectedSource);
    $: placeholderText = getPlaceholderText(selectedSource);

    $: validTargets = selectedSource === 'ipcc' 
        ? options.filter(opt => opt.value !== 'ipcc') 
        : options.filter(opt => opt.value === 'ipcc');
    $: if (selectedSource !== 'ipcc' && selectedTarget !== 'ipcc') {
        selectedTarget = 'ipcc';
    } else if (selectedSource === 'ipcc' && selectedTarget === 'ipcc') {
        selectedTarget = 'greta'; 
    }


    $: selectedContent = currentData.filter(item => {
        if (selectedSource === 'taylor') {
            return item.song_title === selectedSong;
        } else if (selectedSource === 'ipcc') {
            return item.chapter === selectedChapter;
        } else if (selectedSource === 'greta') {
            return item.paragraph === selectedSpeech;
        }
        return false;
    })

    function getDataForTransformation(key, tayToIpcc) {
        switch(key) {
            case 'taylor-to-ipcc': return tayToIpcc;
            case 'ipcc-to-taylor': return ipccToTay;
            case 'greta-to-ipcc': return gretaToIpcc;
            case 'ipcc-to-greta': return ipccToGreta;
            default: return [];
        }
    }

    function getCurrentOptions(source, transformationKey) {
        if (source === 'taylor') return songTitles;
        if (source === 'ipcc') return chapterTitles;
        if (source === 'greta') return speechTitles;
        return [];
    }

    function getCurrentSelection(source) {
        if (source === 'taylor') return selectedSong;
        if (source === 'ipcc') return selectedChapter;
        if (source === 'greta') return selectedSpeech;
        return null;
    }

    function getPlaceholderText(source) {
        if (source === 'taylor') return 'Select a song...';
        if (source === 'ipcc') return 'Select a paragraph...';
        if (source === 'greta') return 'Select a speech...';
        return 'Select an item...';
    }

    function getButtonText(source) {
        if (source === 'taylor') return 'Taylor Swift lyrics';
        if (source === 'ipcc') return 'IPCC paragraph';
        if (source === 'greta') return 'Greta Thunberg speeches';
        return '';
    }

    function handleSelectionChange(event) {
        const selectedValue = event.target.value;
        console.log('Selected Value:', selectedValue);
        if (selectedSource === 'taylor') {
            selectedSong = selectedValue;
        } else if (selectedSource === 'ipcc') {
            selectedChapter = selectedValue;
        } else if (selectedSource === 'greta') {
            selectedSpeech = selectedValue;
        }
        expandedItems.clear();
        expandedItems = expandedItems;
    }

    function toggleDataset() {
        const temp = selectedSource;
        selectedSource = selectedTarget;
        selectedTarget = temp;

        selectedSong = null;
        selectedChapter = null;
        selectedSpeech = null;
        expandedItems.clear();
        expandedItems = expandedItems;
    }

    function toggleTransformed(index) {
        if (expandedItems.has(index)) {
            expandedItems.delete(index);
        } else {
            expandedItems.add(index);
        }
        expandedItems = expandedItems;
    }

    onMount(async () => {
        const [tayResponse, ipccResponse, gretaResponse, ipccToGretaResponse] = await Promise.all([
            fetch(`${base}/tay_to_ipcc.json`),
            fetch(`${base}/ipcc_to_tay.json`),
            fetch(`${base}/greta_to_ipcc.json`),
            fetch(`${base}/ipcc_to_greta.json`)
        ]);
        tayToIpcc = await tayResponse.json();
        ipccToTay = await ipccResponse.json();
        gretaToIpcc = await gretaResponse.json();
        ipccToGreta = await ipccToGretaResponse.json();

        songTitles = [...new Set(tayToIpcc.map(verse => verse.song_title || 'Unknown Title'))];
        chapterTitles = [...new Set(ipccToTay.map(verse => verse.chapter || 'Unknown Chapter'))];
        speechTitles = [...new Set(gretaToIpcc.map(verse => verse.paragraph || 'Unknown Paragraph'))];

    })

    getCurrentOptions(selectedSource, transformationKey);

</script>
    <main>
        <div class="dataset-toggle">
            <div class="text-container">
                <div class="text-column">
                    <p class="text-emphasis">Translate:</p>
                    <p class="text-emphasis">into:</p>
                </div>
                <div class="select-column">
                    <p class="select-column-text">{selectedSourceLabel}</p>
                    <p class="select-column-text">{selectedTargetLabel}</p>
                </div>
            </div>
            <div 
                class="toggle-button"
                on:click={toggleDataset}> 
            </div>
        </div>

        <div class="selection-container">
            {#if currentOptions.length > 0}
                <div class="dropdown-wrapper">
                    <select class="selection-dropdown"
                            value={currentSelection}
                            on:change={handleSelectionChange}>
                        <option value={null}>{placeholderText}</option>
                        {#each currentOptions as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>
            {/if}
        </div>

        {#if selectedContent.length > 0}
            <div class="content-display"></div>
                {#each selectedContent as item, index}
                    <div class="content-item">
                        <p class="original-text" on:click={() => toggleTransformed(index)}>
                            <span class="og-text-span">{@html item.item.replace(/\n/g, '<br>')}</span></p>
                        {#if expandedItems.has(index)}
                            <p class="transformed-text" transition:slide={{ duration: 300, axis: 'y' }}>
                                {@html item.transformed.replace(/\n/g, '<br>')}</p>
                        {/if}
                    </div>
                {/each}
        {/if}

    </main>

<style>

    main {
        padding: 20px;
        line-height: 1.3;
        font-size: 14px;
        color: #24292E;
    }

    .dataset-toggle {
        display: flex;
        justify-content: center;
    }

    .text-container {
        display: flex;
        margin-right: 20px;
    }

    .text-emphasis {
        text-align: right;
        margin: 8px 0;
    }

    .text-column {
        display: flex;
        flex-direction: column;
        margin-right: 10px;
        width: max-content;
        flex-shrink: 0;
    }

    .select-column {
        display: flex;
        flex-direction: column;
    }

    .select-column-text {
        margin: 8px 0;
        text-decoration: underline;
    }

    /* .dataset-select {
        appearance: none;
        background: transparent;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 8px center;
        background-repeat: no-repeat;
        background-size: 16px;
        border: none;
        border-bottom: #24292E solid 1px;
        color: #24292E;
        cursor: pointer;
        font-size: 14px;
        line-height: 1.5;
        padding: 8px 32px 8px 0;
        min-width: fit-content;
        max-width: 100vw;
        font-family: "recursive-sans-linear-static", sans-serif; 
        user-select: none;
    } */

    .toggle-button {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 30px;
        height: 30px;
        padding: 8px;
        align-self: center;
        background-color: #F2F2F2;
        background-image: url('/double-arrow-svgrepo-com.svg');
        background-size: 16px 16px;
        background-position: center;
        background-repeat: no-repeat;
        border: 1px solid #24292E;
        border-radius: 50%;
        box-shadow: rgba(27, 31, 35, 0.04) 0 1px 0, rgba(255, 255, 255, 0.25) 0 1px 0 inset;
        box-sizing: border-box;
        color: #24292E;
        cursor: pointer;
        transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        white-space: nowrap;
        word-wrap: break-word;
    }

    .toggle-button:hover {
        background-color: #F3F4F6;
        text-decoration: none;
        transition-duration: 0.1s;
    }

    .toggle-button:active {
        background-color: #EDEFF2;
        box-shadow: rgba(225, 228, 232, 0.2) 0 1px 0 inset;
        transition: none 0s;
    }

    .dropdown-wrapper {
        display: inline-block;
        position: relative;
    }

    .selection-container {
     margin-bottom: 25px;
    }

    .selection-dropdown {
        appearance: none;
        background: transparent;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 8px center;
        background-repeat: no-repeat;
        background-size: 16px;
        border: none;
        border-bottom: #24292E solid 1px;
        color: #24292E;
        cursor: pointer;
        font-size: 14px;
        line-height: 1.5;
        padding: 8px 32px 8px 0;
        width: 320px;
        max-width: 100vw;
        margin: 20px 0 0 0;
        font-family: "recursive-sans-linear-static", sans-serif; 
    }

    .selection-dropdown option {
        background-color: #FFFFFF;
        color: #24292E;
        padding: 8px 12px;
    }

    .content-display {
        margin-top: 20px;
    }

    .content-item {
        margin-bottom: 15px;
    }

    .original-text {
        margin: 0;
        color: #777;
    }

    .og-text-span{
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .og-text-span:hover {
        background-color: #C9D2F5;
    }

    .transformed-text {
        margin-left: 20px;
        color:#24292E
    }

    /* Mobile styles */
    @media (max-width: 500px) {

        .select-column {
            margin-top: 5px;
            gap: 17px;
        }

        .toggle-button {
            align-self: center;
        }
    
    }

</style>