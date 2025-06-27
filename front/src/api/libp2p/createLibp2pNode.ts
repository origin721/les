import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { kadDHT } from "@libp2p/kad-dht";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { yamux } from "@chainsafe/libp2p-yamux";
import { ping } from "@libp2p/ping";
import { bootstrap } from "@libp2p/bootstrap";
import { identify } from "@libp2p/identify";
import { webRTC } from '@libp2p/webrtc';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { 
  privateKeyFromString,
  recommendedGenerateKeyPair,
} from "../../libs/libp2p";

export interface CreateLibp2pNodeOptions {
  /** Строка приватного ключа для создания PeerId. Если не указан, генерируется новый */
  keyPair?: string;
}

/**
 * Создает и настраивает LibP2P ноду для P2P коммуникации
 * 
 * @param options - Опции для создания ноды
 * @returns Настроенная LibP2P нода
 * 
 * @example
 * ```typescript
 * // Создание ноды с существующим ключом
 * const node = await connectionLibp2p({ keyPair: "existing_key" });
 * 
 * // Создание ноды с новым ключом
 * const node = await connectionLibp2p();
 * ```
 */
export async function connectionLibp2p(
  options?: CreateLibp2pNodeOptions,
) {
  const keyPair = await (() => {
    if (typeof options?.keyPair === 'string') {
      return privateKeyFromString(options.keyPair);
    }
    else if (options?.keyPair) {
      return options.keyPair;
    }
    // Случай если keyPair будет не обязательным
    return recommendedGenerateKeyPair();
 })()

  const node = await createLibp2p({
    privateKey: keyPair,
    transports: [
      webSockets(),
      webRTC(),
      circuitRelayTransport(),
    ],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()],
    peerDiscovery: [
      bootstrap({
        list: [
          // IPFS Bootstrap nodes
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYCg7AmQr5gBMFfSTnH5sD8uq78kKq9AoK",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2Ecstfv8FzDp4E8t8C8XQDdL8c8jD7J9y9qy9Dv3g",
          // IPFS test?
          "/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
          "/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",

          // Ethereum Bootstrap nodes (example)
          "/ip4/13.251.106.93/tcp/30303/p2p/16Uiu2HAmJXsLTpD9A1HcX1oV1Yd111111111111111111111",
          "/ip4/13.251.106.94/tcp/30303/p2p/16Uiu2HAmV6vQWcqj1sQpD7D7D7D7D7D7D7D7D7D7D7D7D7D7",
          // Ethereum test?
          "/dnsaddr/eth-mainnet.bootstrap.libp2p.io/ipfs/QmXoj2e1mQm6aFL7XQ87zB3RQj3KQ51xirW9JCc72XQpT",
          "/dnsaddr/eth-mainnet.bootstrap.libp2p.io/ipfs/QmYyQocm7U7KdL93FLGRW8UfSXWgKPaxX8jTGKHxQKmA4D",

          // libp2p
          "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
          "/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",

          // Polkadot & Substrate
          "/dns/p2p-relay-0.polkadot.io/tcp/30333/p2p/12D3KooWJvyP3VJvV21ccL6pX16LcD5J3c3Z7v1cD7j1jLjJ96V7",

          // // Filecoin
          "/ip4/3.228.170.170/tcp/1347/p2p/12D3KooWJZqV129r1gk8qj1JpD7D7D7D7D7D7D7D7D7D7D7D7D7D7",
          "/ip4/3.228.170.171/tcp/1347/p2p/12D3KooWJZqV129r1gk8qj1JpD7D7D7D7D7D7D7D7D7D7D7D7D7D8",
          // test?
          "/dns4/bootstrap-0.filecoin.io/tcp/1347/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
          "/dns4/bootstrap-1.filecoin.io/tcp/1347/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
          "/dns4/bootstrap-2.filecoin.io/tcp/1347/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
          "/dns4/bootstrap-3.filecoin.io/tcp/1347/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",

        ],
      }),
    ],
    services: {
      identify: identify(),
      dht: kadDHT(),
      pubsub: gossipsub(),
      ping: ping(),
    },
   //logger: {
   //   forComponent: () => new MyService(),
   //}
  });

 //node.addEventListener("peer:discovery", (event) => {
 //  const peerId = event.detail.id;
 //  console.log(`Discovered new peer: ${peerId.toString()}`);
 //  //console.log(`${peerId.toString()}`);
 //});

  return node;
}
