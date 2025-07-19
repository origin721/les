export type ReturnSubscriptionMiddleware = {
  update: () => void;
  onDestroy: () => void;
}