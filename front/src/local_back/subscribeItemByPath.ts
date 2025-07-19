import type { ReturnSubscriptionMiddleware } from "./subscription_middleware";

export const subscribeItemByPath = new Map<
  string,
  ReturnSubscriptionMiddleware
>();
