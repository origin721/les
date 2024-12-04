import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";

export function broadcast_middleware() {
  
  const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

  // Отправить сообщение всем вкладкам
  channel.postMessage({ action: 'notify', data: 'Hello, tabs!' });


  channel.onmessage = (event) => {
    console.log('Message received:', event.data);
    if (event.data.action === 'notify') {
      // Ответить на сообщение
      channel.postMessage({ action: 'response', data: 'Received!' });
    }
  };
}