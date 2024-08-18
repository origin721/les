import { onMount } from "svelte";
import { appLocalStorage } from "../core";
import {worker} from './worker/worker';
import { sharedWorker } from './worker/sharedWorker';

export const appProcessesMount = () => {

    onMount(() => {
        
        // appLocalStorage.setSecret('hihihi');
        // openpgp.generateKey({
        //     name: 'sdfsdf',
        //     pass: '123'
        // }).then(console.log);
    
    });
    // console.log(AES.decrypt(AES.encrypt("asdf", "sdf"), "sdf"));
};