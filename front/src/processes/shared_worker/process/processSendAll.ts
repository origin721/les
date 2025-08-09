import { devLog } from "../../../core/debug/logger";
import { back_store } from "../../../local_back/back_store";
import { responseFromPageByPath } from "./ResponseFromPageByPath";
import { sharedWorkerLastPortsActive } from "./sharedWorkerLastPortsRef";

export const processSendAll = () => {
  try {
    if(sharedWorkerLastPortsActive.size === 0) return;

      Object.values(responseFromPageByPath).forEach((
        action,
      ) => {
        sharedWorkerLastPortsActive.forEach((activePort) => {
            if(action.portSuccessResponse.has(activePort)) return;

            activePort.postMessage(action.lastMessage);
        });
      })
  }
  finally {
    setTimeout(processSendAll, 3000);
    //devLog(back_store);
  }
}