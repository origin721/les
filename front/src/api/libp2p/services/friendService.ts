import { PATHS } from "../../../local_back";
import { shared_worker_store } from "../../../processes";

export const friendService = {
  add_friend,
};

type AddFriendProps = {
  friendPeerId: string;
  accId: string;
};

function add_friend({ friendPeerId, accId }: AddFriendProps) {
  return shared_worker_store.fetch({
    path: PATHS.ADD_FRIEND_AND_SEND_HI,
    body: {
      friendPeerId,
      accId,
    },
  });
}
