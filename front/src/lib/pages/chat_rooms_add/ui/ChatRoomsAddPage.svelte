<script>
  import { writable } from "svelte/store";
  import { Link, ROUTES } from "../../../routing";
  import { submit_stop } from "../../../svelte_default";
  import { events_store } from "../../../processes/create_my_events/events_store";
  import { routingStore } from "../../../routing/stores";
  import { QUERY_PARAMS } from "../../../routing/constants";
  import { search_params_to_string } from "../../../core";

  const defaultRoomName = "no name";
  let name_field = writable("");
  function handleSubmit() {
    const room = events_store.add_room({name: $name_field||defaultRoomName});
    // console.log($name_field);
    routingStore.setPath(
      `${ROUTES.CHAT_ROOMS}?${search_params_to_string({
        [QUERY_PARAMS.ROOM_ID]: room.roomId
      })}`
    );
  }
</script>

<Link href={ROUTES.CHAT_ROOMS}>back</Link>

<form onsubmit={submit_stop}>
  <label>
    <span>Имя комнаты</span>
    <input placeholder={defaultRoomName} bind:value={$name_field} />
  </label>
  <button type="submit" onclick={handleSubmit}>Создать</button>
</form>
