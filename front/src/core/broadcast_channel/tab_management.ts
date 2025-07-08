import { CHANNEL_NAMES } from './constants/CHANNEL_NAMES';
import { FrontMiddlewareActions } from './constants/FRONT_MIDDLEWARE_ACTIONS';
import type { PostMessageParamCloseAllTabs } from './front_middleware_channel';

/**
 * Утилита для управления вкладками через broadcast канал
 */
export class TabManagement {
  private static channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

  /**
   * Отправляет команду закрытия всех вкладок
   * @param excludeCurrentTab - исключить текущую вкладку из закрытия (по умолчанию true)
   * @param reason - причина закрытия вкладок
   */
  static closeAllTabs(excludeCurrentTab: boolean = true, reason: string = 'user_request'): void {
    const message: PostMessageParamCloseAllTabs = {
      action: FrontMiddlewareActions.CLOSE_ALL_TABS,
      data: {
        excludeCurrentTab,
        reason
      }
    };
    
    this.channel.postMessage(message);
  }

  /**
   * Закрывает все вкладки включая текущую
   */
  static closeAllTabsIncludingCurrent(): void {
    this.closeAllTabs(false, 'close_all_including_current');
  }

  /**
   * Закрывает все остальные вкладки, кроме текущей
   */
  static closeAllOtherTabs(): void {
    this.closeAllTabs(true, 'close_other_tabs');
  }
}
