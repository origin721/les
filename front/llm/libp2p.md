# libp2p - Работа с сетевыми функциями

**ВНИМАНИЕ**: Эта информация предназначена как справочная. Не устанавливай эти библиотеки без необходимости!

## Установка пакетов

```bash
npm install libp2p @libp2p/tcp @libp2p/webrtc-star @libp2p/websockets @libp2p/bootstrap
```

## Создание и настройка узла libp2p

```javascript
const { createLibp2p } = require('libp2p');
const { TCP } = require('@libp2p/tcp');
const { WebSockets } = require('@libp2p/websockets');
const { Bootstrap } = require('@libp2p/bootstrap');
const { NOISE } = require('@chainsafe/libp2p-noise');
const { Mplex } = require('@libp2p/mplex');

async function createNode() {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0', '/ip4/0.0.0.0/tcp/0/ws']
    },
    transports: [new TCP(), new WebSockets()],
    connectionEncryption: [new NOISE()],
    streamMuxers: [new Mplex()],
    peerDiscovery: [new Bootstrap({
      list: [
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa'
      ]
    })]
  });

  await node.start();
  console.log('Libp2p node started with id:', node.peerId.toString());

  return node;
}
```

## Подключение к пиру и отправка сообщения

```javascript
async function connectAndSendHi(node, peerId) {
  try {
    await node.dial(peerId);
    console.log(`Connected to peer: ${peerId}`);

    const stream = await node.dialProtocol(peerId, '/your-protocol/1.0.0');
    const writer = stream.sink;
    const reader = stream.source;

    const encoder = new TextEncoder();
    const data = encoder.encode('hi');

    await writer.write(data);
    console.log('Sent "hi" to peer');

    const decoder = new TextDecoder();
    for await (const chunk of reader) {
      console.log('Received:', decoder.decode(chunk));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
```

## Основной код для запуска

```javascript
(async () => {
  const node = await createNode();
  const peerId = 'QmPeerIdToConnectTo'; // Замените на реальный PeerId
  await connectAndSendHi(node, peerId);
})();
```

**Примечания:**
- Замените `'QmPeerIdToConnectTo'` на реальный PeerId
- Замените `'/your-protocol/1.0.0'` на реальный идентификатор протокола
