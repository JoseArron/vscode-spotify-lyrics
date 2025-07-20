<script lang="ts">
  import { get } from 'svelte/store';
  import { vsCodeApi } from './api';
  import { MESSAGES } from '../constants';

  export let message: string = "Noo you're not authenticated yet";

  const api = get(vsCodeApi);

  function handleLogIn() {
    api.postMessage({ type: MESSAGES.REQ_LOG_IN });
  }
</script>

<div class="unauth-container">
  <p class="unauth-message">{message}</p>
  <button on:click={handleLogIn} class="btn btn-primary"> Log In </button>
</div>

<style>
  .unauth-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
  }
</style>
