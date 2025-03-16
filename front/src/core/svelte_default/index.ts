type _SubmitEvent = SubmitEvent & {
    currentTarget: EventTarget & HTMLFormElement;
}

export const submit_stop = (e: _SubmitEvent) => e.preventDefault(); 