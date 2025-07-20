import { readable } from 'svelte/store';

export const vsCodeApi = readable(window.acquireVsCodeApi());
