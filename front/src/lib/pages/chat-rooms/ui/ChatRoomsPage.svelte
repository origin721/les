<script lang="ts">
  import { writable } from "svelte/store";
  import { events_store } from "../../../processes/create_my_events/events_store";
  import { Link, ROUTES } from "../../../routing";
  import { search_params_to_string } from "../../../core";
  import { QUERY_PARAMS } from "../../../routing/constants";
  import { CYAN300 } from "../../../styles/colors";

//   const activeRoom = events_store.add_room({name: 'no name'});
//   function handleMessage() {
//     events_store.add_message({
//         roomId: activeRoom.roomId,
//         message: 'string',
//     });
//   }
  
    // events_store
</script>
<ul>
    <li><h1>ChatRoomsPage</h1></li>
    <li class="text-yellow-500"><Link href={ROUTES.HOME}>На главную</Link></li>
    <li class="text-teal-500"><Link href={ROUTES.CHAT_ROOMS_ADD}>addRoom</Link></li>
</ul>



<!-- <button on:click={handleMessage}>addMessage</button> -->
<div>
    {#each Object.values($events_store.rooms) as room}
        <div class="text-cyan-300">
            <Link href={`${ROUTES.CHAT_ROOMS}?${search_params_to_string({
                [QUERY_PARAMS.ROOM_ID]: room.roomId
            })}`}>
                <h1 class="text-cyan-400">{room.name}</h1>
            </Link>
        </div>
    {/each}
</div>