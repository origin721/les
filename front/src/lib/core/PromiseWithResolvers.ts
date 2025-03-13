/**
 * @deprecated2030 появился Promise.withResolvers()
 * Появилась только в 2024 году так что пока пользуемся этой
 * 
 * @example Пример использования
 * ```ts
 * const deferredCtl = deferred<number>();
 *
 * deferredCtl.promise
 *   .then((value) => {
 *     console.log("Resolved with:", value);
 *   })
 *   .catch((error) => {
 *     console.error("Rejected with:", error);
 *   });
 *
 * // Вызов resolve или reject в другом месте
 * setTimeout(() => {
 *   // Промис будет разрешен со значением 42
 *   deferredCtl.resolve(42); 
 * }, 1000);
 *
 * // Или:
 * // deferredCtl.reject(new Error("Something went wrong"));
 * ```
 */
export function PromiseWithResolvers<T>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}
