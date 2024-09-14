<script lang="ts">
  import { events_store } from "../../../processes/create_my_events/events_store";

    // events_store
</script>

<h1>hi ChatRoomsPage</h1>
<div>
    {#each $events_store.rooms as room}
        
    {/each}
</div>