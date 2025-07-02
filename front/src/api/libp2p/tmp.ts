import { createLibp2p } from 'libp2p'
import { webRTC } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { multiaddr } from '@multiformats/multiaddr'
import { identify } from '@libp2p/identify'
import { debugLog, forceLog } from '../../core/debug/logger'

async function createNode() {
  const node = await createLibp2p({
    addresses: { listen: ['/webrtc'] },
    transports: [webSockets(), webRTC(), circuitRelayTransport()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    services: { identify: identify() }
  })

  await node.start()
  forceLog('LibP2P Node запущен:', node.peerId.toString())

  node.handle('/chat/1.0.0', async ({ stream }) => {
    const decoder = new TextDecoder()
    for await (const chunk of stream.source) {
      debugLog(`[${node.peerId.toString()}] Получено сообщение:`, decoder.decode(chunk))
    }
  })

  return node
}

async function test() {
  const node1 = await createNode()
  const node2 = await createNode()

  debugLog(`Node 1 ID: ${node1.peerId.toString()}`)
  debugLog(`Node 2 ID: ${node2.peerId.toString()}`)

  // Подключаем узлы друг к другу
  await node2.dial(multiaddr(`/p2p/${node1.peerId.toString()}`))
  forceLog('Node 2 подключился к Node 1')

  async function sendMessage(from, toPeerId, message) {
    const { stream } = await from.dialProtocol(toPeerId.toString(), '/chat/1.0.0')
    const encoder = new TextEncoder()
    await stream.sink([encoder.encode(message)])
    debugLog(`[${from.peerId.toString()}] Отправлено:`, message)
  }

  setTimeout(async () => {
    await sendMessage(node1, node2.peerId, 'Привет от Node 1!')
    await sendMessage(node2, node1.peerId, 'Ответ от Node 2!')
  }, 3000)
}

export const tmpTest = test
