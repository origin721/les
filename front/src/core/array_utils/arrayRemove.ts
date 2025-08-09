export function arrayRemove<
T = any,
V = any
>(
  list: T[],
  value: V,
): Exclude<T, V>[] {
  // @ts-ignore
  return list.filter(item => item !== value);
}