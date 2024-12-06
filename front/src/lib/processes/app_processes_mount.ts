import { onMount } from "svelte";
// import {worker} from './worker/worker';
import { createAppSharedWorker } from './shared_worker/create_app_shared_worker';
import { v4 as uuidv4 } from 'uuid';
import { create_my_events } from "./create_my_events";
import { shared_worker_store } from "./shared_worker/shared_worker_store";
import { broadcast_middleware } from "./broadcast_middleware";

export const appProcessesMount = () => {

    onMount(() => {
        //console.log(uuidv4());
        createAppSharedWorker();
        create_my_events();
    
        broadcast_middleware();


    });
    // console.log(AES.decrypt(AES.encrypt("asdf", "sdf"), "sdf"));
};