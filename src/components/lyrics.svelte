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

<div class="lyrics-display">
  {#if currentTrack}
    <div class="track-header">
      <h1 class="track-title">{currentTrack.trackName}</h1>
      <h2 class="track-artist">by {currentTrack.artistName}</h2>
    </div>

    <div class="lyrics-container">
      <div class="lyrics-content">
        {#each lyrics as line, index}
          <div class="lyric-line" data-index={index}>
            {line.lyric}
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="no-track">
      <p>No track currently playing</p>
      <p class="subtitle">Start playing a song on Spotify to see lyrics here</p>
    </div>
  {/if}
</div>

<style>
  .lyrics-display {
    width: 100%;
    height: 100vh;
    background: #293743;
    color: #e8e8e8;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .track-header {
    padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-lg);
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
  }

  .track-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-sm) 0;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1.2;
  }

  .track-artist {
    font-size: 1.2rem;
    font-weight: 400;
    margin: 0;
    color: #d0d0d0;
    opacity: 0.9;
  }

  .lyrics-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
  }

  .lyrics-content {
    padding: var(--spacing-xl) var(--spacing-lg);
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .lyric-line {
    font-size: 2.2rem;
    line-height: 1.8;
    font-weight: 700;
    color: #e8e8e8;
    padding: var(--spacing-md) 0;
    text-align: left;
    word-wrap: break-word;
    transition: all var(--transition-normal);
    opacity: 0.5;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .no-track {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: var(--spacing-xl);
  }

  .no-track p {
    font-size: 1.5rem;
    margin: 0 0 var(--spacing-sm) 0;
    color: #ffffff;
    font-weight: 500;
  }

  .no-track .subtitle {
    font-size: 1rem;
    color: #d0d0d0;
    opacity: 0.8;
    font-weight: 400;
  }

  @media (max-width: 300px) {
    .track-title {
      font-size: 1.5rem;
    }

    .track-artist {
      font-size: 1rem;
    }

    .lyric-line {
      font-size: 1.2rem;
    }

    .lyrics-content {
      padding: var(--spacing-lg) var(--spacing-md);
    }
  }
</style>
