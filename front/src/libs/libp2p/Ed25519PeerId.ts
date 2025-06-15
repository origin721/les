import { createEd25519PeerId } from "@libp2p/peer-id-factory";

export type Ed25519PeerId = Awaited<ReturnType<typeof createEd25519PeerId>>;