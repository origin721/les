import { devLog, prodError } from "../debug/logger";
import { ConnectionTracker } from "./connection-tracker";
import { safeCallback } from "./safe-callback";

export class ReactiveSubscription<T> {
  private currentValue: T | null = null;
  private connectionTracker = new ConnectionTracker();
  private unsubscribe: (() => void) | null = null;

  constructor(
    private subscriptionFactory: (callback: (data: T) => void) => () => void,
    private defaultValue?: T
  ) {
    if (defaultValue !== undefined) {
      this.currentValue = defaultValue;
    }
    devLog('ReactiveSubscription создан');
  }

  subscribe(callback: (data: T) => void): () => void {
    devLog('ReactiveSubscription.subscribe ВЫЗОВ');
    this.setupSubscription(callback);

    return () => {
      devLog('ReactiveSubscription.subscribe ОТПИСКА');
      this.cleanup();
    };
  }

  async getCurrentValue(): Promise<T> {
    devLog('ReactiveSubscription.getCurrentValue ВЫЗОВ, текущее значение:', this.currentValue);

    if (!this.connectionTracker.isConnected() || this.currentValue === null) {
      devLog('ReactiveSubscription.getCurrentValue получение свежего значения');
      return this.fetchFreshValue();
    }

    return this.currentValue;
  }

  isConnected(): boolean {
    return this.connectionTracker.isConnected();
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    return this.connectionTracker.onConnectionChange(callback);
  }

  private setupSubscription(callback?: (data: T) => void) {
    devLog('ReactiveSubscription.setupSubscription установка подписки');
    this.cleanup();

    this.unsubscribe = this.subscriptionFactory((data) => {
      devLog('ReactiveSubscription.setupSubscription получены данные:', data);
      this.currentValue = data;
      this.connectionTracker.setConnected(true);

      if (callback) {
        safeCallback(callback, 'ReactiveSubscription callback error')(data);
      }
    });

    this.connectionTracker.startConnectionTimeout();
  }

  private async fetchFreshValue(): Promise<T> {
    devLog('ReactiveSubscription.fetchFreshValue запрос свежего значения');

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        devLog('ReactiveSubscription.fetchFreshValue таймаут получения значения');
        reject(new Error('Timeout: could not fetch current value'));
      }, 3000);

      const tempUnsub = this.subscriptionFactory((data) => {
        devLog('ReactiveSubscription.fetchFreshValue получено свежее значение:', data);
        clearTimeout(timeout);
        tempUnsub();
        this.currentValue = data;
        resolve(data);
      });
    });
  }

  private cleanup() {
    devLog('ReactiveSubscription.cleanup очистка подписки');
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.connectionTracker.setConnected(false);
  }

  // Дополнительные методы для удобства
  reset() {
    devLog('ReactiveSubscription.reset сброс состояния');
    this.cleanup();
    this.currentValue = this.defaultValue || null;
  }

  setConnectionTimeout(timeout: number) {
    this.connectionTracker.setConnectionTimeout(timeout);
  }
}
