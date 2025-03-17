import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webSockets } from '@libp2p/websockets'


export const createLibp2pNode = async () => {
  const node = await createLibp2p({
   //start: false,
   //addresses: {
   //  // add a listen address (localhost) to accept TCP connections on a random port
   //  listen: ['/ip4/127.0.0.1/tcp/8000/ws']
   //},
    transports: [webSockets()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()]
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