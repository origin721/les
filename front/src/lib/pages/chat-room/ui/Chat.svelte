<script lang="ts">
  import { writable } from "svelte/store";
  import {
    events_store,
    messageSortByDate,
    type RoomData,
  } from "../../../processes/create_my_events/events_store";

  import { Link, ROUTES } from "../../../routing";
  import { event_post } from "../../../api/http/event_post";

  let messageTextField = writable("");

  export let room: RoomData;
  //   $: console.log("listMessages: ", Object.values(room.messages));
</script>

<Link className="text-yellow-500" href={ROUTES.CHAT_ROOMS}>
  <p>back</p>
</Link>

<textarea class="bg-blue-900 text-blue-200" bind:value={$messageTextField} />
<button
  on:click={() => {
    events_store.add_message({
      roomId: room.room_id,
      message: $messageTextField,
    });
    messageTextField.set("");
  }}
  class="text-teal-500">send message</button>
<button on:click={() => event_post({ room_id: room.room_id })}>
    send
</button>
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
