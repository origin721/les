<script>
  import { writable } from "svelte/store";
  import { copyTextToClipboard, defaultCharRanges, randomByRange } from "../../../core";
  import { Link, ROUTES } from "../../../routing";
    import { gen_pass } from "../../../core/random/gen_pass";
  const randomString = writable(getNewRandomString());
  function getNewRandomString() {
    return gen_pass();
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
    <li><button onclick={() => randomString.set(getNewRandomString())}>regen</button></li>
    <li><button onclick={handleClip}>clip</button></li>
    <li>{$randomString}</li>
</ul>
</div>
