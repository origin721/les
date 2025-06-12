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

export async function connectionLibp2p() {
  
  const node = await createLibp2p({
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
          "/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
          "/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",

          // Ethereum Bootstrap nodes (example)
          "/dnsaddr/eth-mainnet.bootstrap.libp2p.io/ipfs/QmXoj2e1mQm6aFL7XQ87zB3RQj3KQ51xirW9JCc72XQpT",
          "/dnsaddr/eth-mainnet.bootstrap.libp2p.io/ipfs/QmYyQocm7U7KdL93FLGRW8UfSXWgKPaxX8jTGKHxQKmA4D",

          // libp2p
          "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
          "/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",

          // Polkadot & Substrate
          "/dns4/p2p-1.dotters.network/tcp/30333/ws/p2p/12D3KooWSCrVyhV8UvkuE6Qz5GX734pAH6xLX1X7499toQhgEJXG",
          "/dns4/p2p-2.dotters.network/tcp/30333/ws/p2p/12D3KooWQnwGADyVK4XffC4RTpM1DgH2KKQx7yHjXqQKZYFqTRX7",
          "/dns4/p2p-3.dotters.network/tcp/30333/ws/p2p/12D3KooWQXkuK9dMW9NXadzDgS7KxMGqf4NcG9i9SasLL8RN4XjW",

          // Filecoin
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
    
  });

  node.addEventListener("peer:discovery", (event) => {
    const peerId = event.detail.id;
    console.log(`Discovered new peer: ${peerId.toString()}`);
  });
}
