<script lang="ts">
  import { get } from 'svelte/store';
  import { vsCodeApi } from './api';
  import { MESSAGES } from '../constants';
  import { onMount } from 'svelte';

  export let currentTrack: {
    trackName: string;
    artistName: string;
    plainLyrics: string;
    duration: number;
  } | null = null;

  const api = get(vsCodeApi);

  onMount(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case MESSAGES.SEND_TRACK:
          currentTrack = message.track;
          break;
      }
    });

    api.postMessage({
      type: MESSAGES.REQ_TRACK
    });
  });
</script>

<div class="lyrics-container">
  {#if currentTrack}
    <h2>{currentTrack.trackName} by {currentTrack.artistName}</h2>
    <p>{currentTrack.plainLyrics}</p>
  {:else}
    <div class="no-track">
      <p>No track currently playing.</p>
    </div>
  {/if}
</div>

<style>
  .lyrics-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
  }
</style>
