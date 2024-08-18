import { writable } from "svelte/store"

export const createAppHeaderStore = () => {
    const store = writable(getInitialValue());

    function getInitialValue() {
        return {
            message: 'Заголовок',
        }
    }


    return {
        subscribe: store.subscribe,
        setMessage: (newMessage:string) => store.update((prev) => ({
            ...prev,
            message: newMessage,
        })),
    }
}
