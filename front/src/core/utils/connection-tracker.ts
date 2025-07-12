import { devLog, prodError } from "../debug/logger";

export class ConnectionTracker {
  private isConnectedFlag = false;
  private connectionChangeCallbacks: ((connected: boolean) => void)[] = [];
  private connectionTimeout = 5000;

  setConnected(connected: boolean) {
    if (this.isConnectedFlag !== connected) {
      this.isConnectedFlag = connected;
      devLog('ConnectionTracker изменение соединения:', connected);
      this.notifyConnectionChange(connected);
    }
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    devLog('ConnectionTracker.onConnectionChange ПОДПИСКА');
    this.connectionChangeCallbacks.push(callback);

    // Сразу вызываем с текущим статусом
    try {
      callback(this.isConnectedFlag);
    } catch (error) {
      prodError('ConnectionTracker.onConnectionChange ошибка в callback:', error);
    }

    return () => {
      devLog('ConnectionTracker.onConnectionChange ОТПИСКА');
      const index = this.connectionChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionChangeCallbacks.splice(index, 1);
      }
    };
  }

  startConnectionTimeout() {
    devLog('ConnectionTracker запуск таймаута соединения:', this.connectionTimeout);
    setTimeout(() => {
      if (!this.isConnectedFlag) {
        devLog('ConnectionTracker таймаут соединения, помечаем как отключен');
        this.setConnected(false);
      }
    }, this.connectionTimeout);
  }

  setConnectionTimeout(timeout: number) {
    this.connectionTimeout = timeout;
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionChangeCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        prodError('ConnectionTracker ошибка в callback изменения соединения:', error);
      }
    });
  }
}
