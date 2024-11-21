import { onMount } from "svelte";
import { appLocalStorage } from "../core";
// import {worker} from './worker/worker';
import { createAppSharedWorker } from './shared_worker/create_app_shared_worker';
import { v4 as uuidv4 } from 'uuid';
import { create_my_events } from "./create_my_events";
import { shared_worker_store } from "./shared_worker/shared_worker_store";

export const appProcessesMount = () => {

    onMount(() => {
        console.log(uuidv4());
        //createAppSharedWorker();
        create_my_events();
        shared_worker_store
          .fetch({payload: 'hi'})
          .then((p) => console.log('hiSwelteWorker',{p}));
        // appLocalStorage.setSecret('hihihi');
        // openpgp.generateKey({
        //     name: 'sdfsdf',
        //     pass: '123'
        // }).then(console.log);
    
    });
    // console.log(AES.decrypt(AES.encrypt("asdf", "sdf"), "sdf"));
};