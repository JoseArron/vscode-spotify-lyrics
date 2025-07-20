<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { vsCodeApi } from './api';
  import Loading from './loading.svelte';
  import Unauthenticated from './unauthenticated.svelte';
  import { MESSAGES } from '../constants';

  let isAuthenticated = false;
  let isLoading = true;

  const api = get(vsCodeApi);

  onMount(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case MESSAGES.SEND_AUTH_STATUS:
          isAuthenticated = message.isAuthenticated;
          isLoading = false;
          break;
      }
    });

    // check if user is authenticated
    api.postMessage({ type: MESSAGES.REQ_AUTH_STATUS });
  });

  function handleLogout() {
    api.postMessage({ type: MESSAGES.REQ_LOG_OUT });
  }
</script>

<div class="container">
  {#if isLoading}
    <Loading message="Checking authentication..." />
  {:else if !isAuthenticated}
    <Unauthenticated />
  {:else}
    <div>
      <p>Welcome to spotify lyrics!</p>
    </div>
  {/if}
</div>

<style>
  .container {
    border: red solid 1px;
    padding: 20px;
    text-align: center;
  }
</style>
