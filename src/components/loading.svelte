<script lang="ts">
  export let message: string = 'Loading...';
</script>

<div class="loading-container">
  <span class="loader"></span>
  <p class="loading-message">{message}</p>
</div>

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
  }

  .loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--spotify-green);
    border-top-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: spin 1s linear infinite;
  }

  .loading-message {
    font-size: var(--font-size-lg);
    text-align: center;
  }
</style>
