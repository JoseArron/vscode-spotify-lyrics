<script lang="ts">
  import { onMount } from 'svelte';
  import Loading from './loading.svelte';

  let isAuthenticated = false;
  let isLoading = true;

  interface State {
    isAuthenticated: boolean;
  }

  const vscode = acquireVsCodeApi<State>();

  onMount(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'auth-status':
          isAuthenticated = message.isAuthenticated;
          isLoading = false;
          break;
      }
    });

    // check if user is authenticated
    vscode.postMessage({ type: 'check-auth' });
  });

  function handleSignIn() {
    console.log('sign in');
    vscode.postMessage({ type: 'sign-in' });
  }

  function handleLogout() {
    console.log('logout');
    vscode.postMessage({ type: 'logout' });
  }
</script>

<div class="container">
  {#if isLoading}
    <Loading message="Checking authentication..." />
  {:else if !isAuthenticated}
    <div>
      <p>Nooo, youre not authenticated yet</p>
    </div>
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
