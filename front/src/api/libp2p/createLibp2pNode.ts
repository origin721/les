import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@chainsafe/libp2p-noise';
import { mdns } from '@libp2p/mdns';
import { kadDHT } from '@libp2p/kad-dht';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { yamux } from '@chainsafe/libp2p-yamux';
import { ping } from '@libp2p/ping';

const node = await createLibp2p({
  addresses: {
    listen: [
      '/ip4/0.0.0.0/tcp/9001/ws',
      '/ip4/0.0.0.0/tcp/9002',
    ],
  },
  transports: [
    webSockets()
  ],
  streamMuxers: [yamux()],
  connectionEncrypters: [noise()],
  peerDiscovery: [mdns()],
  services: {
    dht: kadDHT(),
    pubsub: gossipsub(),
    ping: ping(),
  }
});
