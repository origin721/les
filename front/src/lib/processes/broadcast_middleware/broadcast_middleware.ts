import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type { PostMessageParam } from "../../core/broadcast_channel/front_middleware_channel";
import { appAuthStore } from "../../stores";

export function broadcast_middleware() {
  
  const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);
  // front_middleware_channel

  // Отправить сообщение всем вкладкам
  //channel.postMessage({ action: 'notify', data: 'Hello, tabs!' });


  channel.onmessage = (event) => {
    //console.log('Message received:', event.data);
    const param: PostMessageParam = event.data;
    if (param.action === FrontMiddlewareActions.ADD_ACCOUNTS) {
      appAuthStore._add(param.data.list);
    }
    if(param.action === FrontMiddlewareActions.DELETE_ACCOUNTS) {
      appAuthStore._onDeleteSecret(param.data.ids)
    }
  };
}