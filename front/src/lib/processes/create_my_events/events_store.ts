import { get, writable } from "svelte/store";
import { uuidv4 } from "../../core/uuid";

export const events_store = create_events_store();

type AddRoomParams = {
  name: string;
};

type AddMessageParams = {
  roomId: string;
  message: string;  
};

function create_events_store() {
  const store = writable(get_initial_store());
  function add_room(rParams: AddRoomParams) {
    const roomId = uuidv4();
    const entity: RoomData = {
        roomId,
        name: 'no name',
        messages: {},
    };
    const result = {
      roomId,
      entity,
    };

    store.update((prev) => {
      const new_rooms: EntityRoom = {
        ...prev.rooms,
        [roomId]: {
          name: rParams.name,
          roomId,
          messages: {},
        }
      };
      // result.entity = new_rooms;
      const _s: EventsStore = {
        ...prev,
        rooms: new_rooms,
      };
      return _s;
    });

    return {
      roomId
    }
  }
  const add_message = (mParams: AddMessageParams) => {
    const messageId = uuidv4();
    store.update((prev) => {
      let prev_messages = extractMessages({
        data: prev,
        roomId: mParams.roomId,
        messageId: messageId,
      });
      // const room
      // prev_room.push(data);
      const result = {
        ...prev,
        rooms: {
          ...prev.rooms,
          [mParams.roomId]: {
            ...prev.rooms[mParams.roomId],
            messages: {
              ...prev.rooms[mParams.roomId].messages,
              [messageId]: {
                text: mParams.message,
                created_date: new Date(),
              },
            },
          },
        },
      };

      return result;
    });
  };

  return {
    subscribe: store.subscribe,
    add_message,
    add_room,
    get_room_by_id: (pRoomId: string): RoomData | null => Object
      .values(get(store).rooms)
      .find((r) => r.roomId === pRoomId)||null
  };
}

type MessageData = {
  text: string;
  created_date: Date;
};

export type RoomData = {
  name: string;
  roomId: string;
  messages: EntityMessage;
};

type EntityById<T> = Record<string, T>;
type EntityMessage = EntityById<MessageData>;
type EntityRoom = EntityById<RoomData>;

type EventsStore = {
  rooms: EntityRoom;
};

function get_initial_store(): EventsStore {
  return {
    rooms: {},
  };
}

type ExtractMessagesParams = {
  data: EventsStore;
  roomId: string;
  messageId: string;
}
function extractMessages(params: ExtractMessagesParams) {
  try {
    const messages = params.data.rooms[params.roomId].messages;
    if(!messages) return null;
    return messages;
  }
  catch(err) {
    return null;
  }
}
