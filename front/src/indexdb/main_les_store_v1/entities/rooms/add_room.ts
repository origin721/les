import { back_store } from "../../../../local_back/back_store/back_store";
import { prodError, prodInfo } from "../../../../core/debug/logger";
import { rooms_store_utils } from "../../../../local_back/back_store";
import { ROOMS_VERSION } from "./constants";
import { EntityService } from "../../services/entity_service";
import { RoomEntity, RoomEntityFull } from "./types";

export async function add_room(
  new_list: RoomEntity[],
  explicitMyAccId?: string,
): Promise<void> {
  try {
    prodInfo(
      `Добавление ${new_list.length} комнат, myAccId=${explicitMyAccId}`,
    );

    // Используем EntityService для добавления комнат
    const addedRooms = await EntityService.addEntities(
      "rooms",
      new_list,
      ROOMS_VERSION,
      explicitMyAccId,
    );

    // Синхронизируем с back_store через сервис
    const roomsToAdd: RoomEntity[] = addedRooms.map((room) => ({
      ...room,
      id: room.id,
    }));
    rooms_store_utils.add(roomsToAdd);

    prodInfo(
      `✅ Добавлено ${addedRooms.length} комнат для аккаунта ${explicitMyAccId || "auto"}`,
    );
  } catch (error) {
    prodError(
      `❌ Ошибка добавления комнат для аккаунта ${explicitMyAccId || "auto"}:`,
      error,
    );
    throw error;
  }
}
