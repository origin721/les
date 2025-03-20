import { createLibp2p } from 'libp2p';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { webSockets } from '@libp2p/websockets';
import { webRTC } from '@libp2p/webrtc';
//import { mdns } from '@libp2p/mdns';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import {bootstrap} from '@libp2p/bootstrap';
import { identify } from '@libp2p/identify';

async function derivePrivateKey(seedPhrase) {
    const encoder = new TextEncoder();
    const data = encoder.encode(seedPhrase);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
}

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
    },
    peerDiscovery: [
      bootstrap({
        list: ['/ip4/127.0.0.1/tcp/63785/ws/p2p/QmPeerId'], // Bootstrap nodes
      }),
    ],
   //peerDiscovery: [
   //  // Для локальных соединений 
   //  mdns()
   //],
  })

  // start libp2p
  // Подписываемся на тему
 //await node.pubsub.subscribe('наш-секретный-пароль');

 //// Обработка входящих сообщений
 //node.pubsub.on('message', async (message) => {
 //  console.log('Узел 1 получил сообщение:', message.data.toString());
 //  const peerId = message.from; // Peer ID отправителя
 //  const multiaddr = `/ip4/127.0.0.1/tcp/63785/ws/p2p/${peerId}`;

 //  // Подключаемся к узлу
 //  const { stream } = await node.dialProtocol(multiaddr, '/chat/1.0.0');
 //  const encoder = new TextEncoder();
 //  await stream.sink([encoder.encode('Привет от Узла 1!')]);
 //});

 //// Публикуем сообщение
 //await node.pubsub.publish('наш-секретный-пароль', new TextEncoder().encode('Мой Peer ID: ' + node.peerId.toString()));
 



  node.addEventListener('peer:discovery', (evt) => {
    console.log(`Обнаружен пир: ${evt.detail.id.toString()}`)
  })

  await node.start()
  console.log(`Узел запущен: ${node.peerId.toString()}`)
  await node.start()
  console.log('libp2p has started')

  // print out listening addresses
  console.log('listening on addresses:')
  node.getMultiaddrs().forEach((addr) => {
    console.log(addr.toString())
  })

 //// stop libp2p
 //await node.stop()
 //console.log('libp2p has stopped')


  return node;
}

createLibp2pNode();
createLibp2pNode();