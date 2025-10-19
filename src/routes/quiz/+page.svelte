<script>
    import { tayToIpccStore } from '$lib/stores';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';


    let tayToIpcc = [];
    let selectedVerse = null;
    let matchedVerse
    let selectedTitle = ''
    let mainQuizScreen = true
    let viewAnswer = false

    function generateRandomVerse() {
        matchedVerse = true
        viewAnswer = false

        if (tayToIpcc.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * tayToIpcc.length);
        selectedVerse = tayToIpcc[randomIndex];

        mainQuizScreen = true
        selectedTitle = ''

        return selectedVerse.transformed;
    }

    function matchSelectedSong(event) {
        selectedTitle = event.target.value;
        matchedVerse = selectedVerse.song_title === selectedTitle;

        if(matchedVerse) {
            mainQuizScreen = false
            selectedTitle = ''
        }

    }

    function showResponse() {
        viewAnswer = true
        selectedTitle = selectedVerse.song_title
    }

    $: songTitles = tayToIpcc.length > 0 ? [...new Set(tayToIpcc.map(verse => verse.song_title || 'Unknown Title'))] : [];
    
    onMount(async () => {
        try {
            const response = await fetch(`${base}/tay_to_ipcc.json`);
            tayToIpcc = await response.json();
            generateRandomVerse();
        } catch (error) {
            console.error('Failed to load quiz data:', error);
        }
    })

</script>
<main>
    {#if mainQuizScreen && selectedVerse}
        <div class="quiz-screen">
            <p class="other-text">This is a "scientific version" of a Taylor's verse:</p>
            <p>{selectedVerse.transformed}</p>
            <p class="other-text">What song is this?</p>

            <select class="select-song" on:change={matchSelectedSong} bind:value={selectedTitle}>
                {#if !viewAnswer}
                    <option value="" disabled selected>Select a song</option>
                    {#each songTitles as title}
                        <option value="{title}">{title}</option>
                    {/each}
                {:else}
                    <option value="{selectedTitle}">{selectedTitle}</option>
                {/if}
            </select>
            
            <button class="try-again-btn" on:click={generateRandomVerse}>Try another</button>
            {#if viewAnswer}
                <p class="text"><span class="response-text">{@html selectedVerse.item.replace(/\n/g, '<br>')}</span></p>
            {:else}
                <div class="answer">
                    <button class="answer-btn" on:click={showResponse}>Show answer</button>
                </div>
            {/if}
        </div>
    {/if}

    {#if !mainQuizScreen}
        <div class="result-screen">
            <p class="result-text">Yessss!</p>
            <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmUybWRtOW1mam04Y3BxM3pjZzRnc2Zpb3RnOWQ2Y2twaHRncmdrMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Y3EIwTKTeL1rEyc2ZA/giphy.gif" alt="" width="380">
            <button class="try-again-btn end" on:click={generateRandomVerse}>Try another</button>
        </div>
    {:else if matchedVerse == false && mainQuizScreen && !viewAnswer}
        <p class="result-text">That's not quite right</p>
        <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcndlbmwwNG92MDZoaWYyNDNhaDkyZ3R0anZiaGNqYTM5OXVuYTE3eCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3otWpAMUG1n5CHSVtm/giphy.gif" alt="incorrect image" width="380">

    {:else if tayToIpcc.length === 0}
        <div class="loading">
            <p>Loading quiz...</p>
        </div>
    {/if}
</main>

<style>

main {
    padding: 20px;
    line-height: 1.3;
    font-size: 14px;
    color: #24292E;
}

.other-text {
    color: #777;

}

.select-song {
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
    width: 70%;
    font-family: "recursive-sans-linear-static", sans-serif; 
}

.try-again-btn {
    appearance: none;
    background: transparent;
    padding: 8px 10px;
    border-radius: 5px;
    border: solid 1px #24292E;
    margin-left: 5px;
    color: #24292E;
}

.result-text {
    font-size: 18px;
    margin-top: 30px;
}

.result-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.answer {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.answer-btn {
    appearance: none;
    background: transparent;
    padding: 8px 10px;
    border-radius: 5px;
    border: solid 1px #777;
    margin-left: 5px;
    color: #777;
}

.try-again-btn.end {
    margin: 20px 0;
    width: fit-content;
}

.response-text {
    background-color: #C9D2F5;
    line-height: 1.5;
}

</style>