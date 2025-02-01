<script lang="ts">
  import { writable } from "svelte/store";
  import {
    events_store,
    messageSortByDate,
    type RoomData,
  } from "../../../processes/create_my_events/events_store";

  import { Link, ROUTES } from "../../../routing";
  import { event_post, PATHS_POST_EVENTS } from "../../../api/http/event_post";

  let messageTextField = writable("");

  function handle_send_message() {
    event_post({
      path: PATHS_POST_EVENTS.ping,
      payload: {
        room_ids: Object.keys($events_store.rooms),
        message: "text",
        registration_id: "text",
        owner_id: "id",
        user_ids: [],
      },
    });
  }

  interface Props {
    room: RoomData; //   $: console.log("listMessages: ", Object.values(room.messages));
  }

  let { room }: Props = $props();
  
</script>

<Link className="text-yellow-500" href={ROUTES.CHAT_ROOMS}>
  <p>back</p>
</Link>

<textarea class="bg-blue-900 text-blue-200" bind:value={$messageTextField}></textarea>
<button
  onclick={() => {
    events_store.add_message({
      roomId: room.room_id,
      message: $messageTextField,
    });
    messageTextField.set("");
  }}
  class="text-teal-500"
>
  send message
</button>

<button onclick={handle_send_message}> send </button>
<div>
  <h1 class="text-2xl text-cyan-400">{room.name}</h1>
  <div>
    {#each messageSortByDate(room.messages) as message}
      <div>
        <p>{message.created_date}</p>
        <p>{message.text}</p>
        <hr />
      </div>
    {/each}
  </div>
</div>
<div>
  <pre>{JSON.stringify($events_store, null, 2)}</pre>
</div>
