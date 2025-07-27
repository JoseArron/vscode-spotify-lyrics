<script lang="ts">
  import { get } from 'svelte/store';
  import { vsCodeApi } from './api';
  import { MESSAGES } from '../constants';
  import { onMount, onDestroy } from 'svelte';
  import type { Track } from '../domains/spotify/spotify.types';
  import type { SyncedLyrics } from '../domains/spotify/lyrics.types';

  export let currentTrack: Track | null = null;

  let lyrics: SyncedLyrics[] = [];
  let currentLyricIndex: number = -1;
  let startTime: number = 0;
  let initialProgress: number = 0;
  let animationFrameId: number | null = null;
  let lyricsContainer: HTMLDivElement;

  const api = get(vsCodeApi);

  function startLyricSync(progressMs: number) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    // init
    startTime = performance.now(); // current time in ms
    initialProgress = progressMs;

    updateLyrics();
  }

  function updateLyrics() {
    if (!currentTrack || lyrics.length === 0) {
      return;
    }

    // calculate current playback position
    const elapsed = performance.now() - startTime;
    const currentProgress = initialProgress + elapsed;

    // set current line lyric
    let newIndex = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentProgress >= lyrics[i].time) {
        newIndex = i;
        break;
      }
    }

    // update style if changed
    if (newIndex !== currentLyricIndex) {
      currentLyricIndex = newIndex;
      updateLyricClasses();
      scrollToCurrentLyric();
    }

    // continue
    animationFrameId = requestAnimationFrame(updateLyrics);
  }

  function updateLyricClasses() {
    if (!lyricsContainer) return;

    const lyricsContent = lyricsContainer.querySelector('.lyrics-content');
    if (!lyricsContent) return;

    Array.from(lyricsContent.children).forEach((element, index) => {
      const lyricElement = element as HTMLElement;
      lyricElement.classList.remove('current', 'upcoming', 'past');

      if (index === currentLyricIndex) {
        lyricElement.classList.add('current');
      } else if (index > currentLyricIndex) {
        lyricElement.classList.add('upcoming');
      } else {
        lyricElement.classList.add('past');
      }
    });
  }

  function scrollToCurrentLyric() {
    if (currentLyricIndex < 0 || !lyricsContainer) return;

    const currentElement = lyricsContainer.querySelector(
      `[data-index=\"${currentLyricIndex}\"]`
    ) as HTMLElement;

    if (currentElement) {
      // calculate scroll position to center the current lyric
      const containerHeight = lyricsContainer.clientHeight;
      const elementTop = currentElement.offsetTop;
      const elementHeight = currentElement.offsetHeight;
      const scrollPosition =
        elementTop - containerHeight / 2 + elementHeight / 2;

      lyricsContainer.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }

  function getLyricClass(index: number): string {
    if (index === currentLyricIndex) {
      return 'lyric-line current';
    } else if (index > currentLyricIndex) {
      return 'lyric-line upcoming';
    } else {
      return 'lyric-line past';
    }
  }

  onMount(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case MESSAGES.SEND_TRACK:
          currentTrack = message.track as Track;
          lyrics = message.track.lyrics;
          currentLyricIndex = -1;

          if (currentTrack && lyrics.length > 0) {
            startLyricSync(currentTrack.progressMs);
          }
          break;
      }
    });

    api.postMessage({
      type: MESSAGES.REQ_TRACK
    });
  });

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
</script>

<div class="lyrics-display">
  {#if currentTrack}
    <div class="track-header">
      <h1 class="track-title">{currentTrack.trackName}</h1>
      <h2 class="track-artist">by {currentTrack.artistName}</h2>
    </div>

    <div class="lyrics-container" bind:this={lyricsContainer}>
      <div class="lyrics-content">
        {#each lyrics as line, index}
          <div class={getLyricClass(index)} data-index={index}>
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
    background: #650000;
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
    font-size: 2rem;
    line-height: 1.5;
    font-weight: 700;
    color: #e8e8e8;
    padding: var(--spacing-md) 0;
    text-align: left;
    word-wrap: break-word;
    transition: all var(--transition-normal);
    opacity: 0.5;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    letter-spacing: -0.02em;
    cursor: pointer;
    text-decoration: none;
  }

  .lyric-line.current {
    color: #ffffff;
    opacity: 1;
  }

  .lyric-line.upcoming {
    opacity: 0.5;
  }

  .lyric-line.past {
    opacity: 0.2;
  }

  .lyric-line:hover {
    color: #ffffff;
    opacity: 1;
    text-decoration: underline;
  }

  /* Custom scrollbar styling */
  .lyrics-container::-webkit-scrollbar {
    width: 8px;
  }

  .lyrics-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  .lyrics-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  .lyrics-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
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
