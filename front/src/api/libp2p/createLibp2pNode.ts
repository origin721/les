import { createLibp2p } from 'libp2p';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { webSockets } from '@libp2p/websockets';
import { webRTC } from '@libp2p/webrtc';
//import { mdns } from '@libp2p/mdns';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { identify } from '@libp2p/identify';


export const createLibp2pNode = async () => {
  const node = await createLibp2p({
    start: false,
    addresses: {
      listen: [
        '/p2p-circuit',
        '/webrtc'
      ],
    },
    transports: [
      webSockets(),
      webRTC(),
      circuitRelayTransport(),
    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
    }
   //peerDiscovery: [
   //  // Для локальных соединений 
   //  mdns()
   //],
  })

  // start libp2p
  await node.start()
  console.log('libp2p has started')

  // print out listening addresses
  console.log('listening on addresses:')
  node.getMultiaddrs().forEach((addr) => {
    console.log(addr.toString())
  })

  // stop libp2p
  await node.stop()
  console.log('libp2p has stopped')


  return node;
}

createLibp2pNode();