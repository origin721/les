<script lang="ts">
  import {
    events_store,
    type RoomData,
  } from "../../../processes/create_my_events/events_store";

  import { Link, ROUTES } from "../../../routing";

  export let room: RoomData;
  $: console.log('listMessages: ', Object.values(room.messages));
</script>

<Link className="text-yellow-500" href={ROUTES.CHAT_ROOMS}>
  <p>back</p>
</Link>

<button
  on:click={() =>
    events_store.add_message({
      roomId: room.roomId,
      message: 'hi)) sdfsdfsd',
    })}
  class="text-teal-500">send message</button
>
<div>
  <h1 class="text-2xl text-cyan-400">{room.name}</h1>
  <div>
    {#each Object.values(room.messages) as message}
      <p>{message.created_date}</p>
      <p>{message.text}</p>
    {/each}
  </div>
</div>
