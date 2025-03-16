/**
 * @example
  *```
const order = create_promise_order();
console.log(new Date());
order((res) => {
  setTimeout(() => {
    console.log('1_Ok');// первым выполнится
    res();
    console.log(new Date());
  }, 2000)
});
order((res) => {
  setTimeout(() => {
    console.log('2_Ok');// вторым выполнится
    console.log(new Date());
    res();
  }, 1000)
});
  ```
 *
 */
export function create_promise_order() {
  let prevPromise = Promise.resolve();

  return (fn: (res: () => void) => void) => {
    const promiseBeforeStart = prevPromise;
    return prevPromise = new Promise((res) => {
      promiseBeforeStart.finally(() => {
        fn(res);
      });
    });
  }
}
