<script lang="ts">
  import { events_store } from "../../../processes/create_my_events/events_store";

  import { Link, ROUTES } from "../../../routing";
  import { QUERY_PARAMS } from "../../../routing/constants";
  import { routingStore } from "../../../routing/stores";
  import Chat from "./Chat.svelte";

  let room: ReturnType<typeof events_store.get_room_by_id> = null;
  $: {
    $events_store;
    room = events_store.get_room_by_id(
      $routingStore.queryParams.get(QUERY_PARAMS.ROOM_ID)!
    );
  }
</script>

<h1 class="text-cyan-400 text-lg">Chat</h1>

{#if room}
  <Chat {room} />
{:else}
  <Link className="text-yellow-500" href={ROUTES.CHAT_ROOMS}>back</Link>

  <h1 class="text-rose-600">Комната не найдена</h1>
{/if}
