<script>
  import { writable } from "svelte/store";
  import { copyTextToClipboard, defaultCharRanges, randomByRange } from "../../../core";
  import { Link, ROUTES } from "../../../routing";
  const randomString = writable(getNewRandomString());
  function getNewRandomString() {
    return randomByRange(defaultCharRanges, [40, 60]);
  };

  function handleClip() {
    copyTextToClipboard($randomString) 
  }
</script>

<div class="" data-widget-name="Random">
  <ul>
    <li>
      <Link href={ROUTES.HOME}>Назад</Link>
    </li>
    <li><button on:click={() => randomString.set(getNewRandomString())}>regen</button></li>
    <li><button on:click={handleClip}>clip</button></li>
    <li>{$randomString}</li>
</ul>
</div>
