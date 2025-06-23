type _SubmitEvent = SubmitEvent & {
    currentTarget: EventTarget & HTMLFormElement;
}
//TODO переименовать директорию из svelte_default в svelte
export const submit_stop = (e: _SubmitEvent) => e.preventDefault(); 