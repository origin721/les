import type { createLibp2p } from "libp2p";

export const libp2pService = {
  addFriend: (p: { node: ReturnType<typeof createLibp2p> }) => {
    p.node;
  },
};
