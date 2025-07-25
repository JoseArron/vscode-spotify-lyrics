<script lang="ts">
  import { get } from 'svelte/store';
  import { vsCodeApi } from './api';
  import { MESSAGES } from '../constants';
  import { onMount } from 'svelte';
  import type { Track } from '../domains/spotify/spotify.types';
  import type { SyncedLyrics } from '../domains/spotify/lyrics.types';

  export let currentTrack: Track | null = null;

  let lyrics: SyncedLyrics[] = [];

  const api = get(vsCodeApi);

  onMount(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case MESSAGES.SEND_TRACK:
          currentTrack = message.track as Track;
          lyrics = message.track.lyrics;
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
    <p>{currentTrack.lyrics[0].lyric}</p>
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
