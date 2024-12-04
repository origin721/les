import { onMount } from "svelte";
import { appLocalStorage, create_promise_order } from "../core";
// import {worker} from './worker/worker';
import { createAppSharedWorker } from './shared_worker/create_app_shared_worker';
import { v4 as uuidv4 } from 'uuid';
import { create_my_events } from "./create_my_events";
import { shared_worker_store } from "./shared_worker/shared_worker_store";
import { broadcast_middleware } from "./broadcast_middleware";
import { add_accounts } from "../core/indexdb/accounts/add_accounts";
import { get_accounts } from "../core/indexdb/accounts/get_accounts";

export const appProcessesMount = () => {

    onMount(() => {
        console.log(uuidv4());
        createAppSharedWorker();
        create_my_events();
        shared_worker_store
          .fetch({payload: 'hi'})
          .then((p) => console.log('hiSwelteWorker',{p}));
        shared_worker_store
          .fetch({payload: 'hi'})
          .then((p) => console.log('hiSwelteWorker',{p}));
        // appLocalStorage.setSecret('hihihi');
        // openpgp.generateKey({
        //     name: 'sdfsdf',
        //     pass: '123'
        // }).then(console.log);
    
        broadcast_middleware();
        add_accounts([ {name: 'hi'} ]);
        add_accounts([ {name: 'hi1'}, {name:'hi22343243'} ])
          .then(() => {

            get_accounts().then(console.log);
            get_accounts().then(console.log);
          });


    });
    // console.log(AES.decrypt(AES.encrypt("asdf", "sdf"), "sdf"));
};