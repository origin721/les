import { onDestroy } from 'svelte';
import type { Readable } from 'svelte/store';

export function writableToState<T>(store: Readable<T>): {state: T} {
  let state = $state<T>();

  const unsubscribe = store.subscribe(value => {
    state = value;
  });

  onDestroy(unsubscribe);

  return {
    get state() { return state },
    set(value: T) { state = value }
  };
}