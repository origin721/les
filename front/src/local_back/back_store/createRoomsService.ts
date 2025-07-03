import type { RoomEntity, RoomEntityFull } from "../../indexdb/rooms/add_room";

export const create_rooms_service = () => ({
  byId: {} as Record<string, RoomEntityFull>,
  
  async add(rooms: RoomEntity[], accountId?: string): Promise<void> {
    for(let room of rooms) {
      this.byId[room.id] = room as RoomEntityFull;
    }
  },

  async delete(ids: string[]) {
    for (let id of ids) {
      delete this.byId[id];
    }
  },

  async getById(roomId: string): Promise<RoomEntityFull | null> {
    return this.byId[roomId] || null;
  },

  async put(rooms: RoomEntityFull[]) {
    for(let room of rooms) {
      this.byId[room.id] = room;
    }
  }
});
