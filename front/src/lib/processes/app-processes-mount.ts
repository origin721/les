import { onMount } from "svelte";
import { appLocalStorage } from "../core";
import {worker} from './worker/worker';
import { sharedWorker } from './worker/sharedWorker';
import { v4 as uuidv4 } from 'uuid';

export const appProcessesMount = () => {

    onMount(() => {
        console.log(uuidv4());

        // appLocalStorage.setSecret('hihihi');
        // openpgp.generateKey({
        //     name: 'sdfsdf',
        //     pass: '123'
        // }).then(console.log);
    
    });
    // console.log(AES.decrypt(AES.encrypt("asdf", "sdf"), "sdf"));
};