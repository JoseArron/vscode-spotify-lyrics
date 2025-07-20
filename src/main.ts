import { mount } from "svelte";
import Lyrics from "./components/lyrics.svelte";

const app = mount(Lyrics, {
  target: document.getElementById("app")!,
});

export default app;
