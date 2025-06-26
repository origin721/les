<script lang="ts">
    import { onMount } from "svelte";
    import { PATHS } from "../../../local_back";
    import { shared_worker_store } from "../../../processes";
    import { Link, ROUTES } from "../../../routing";
    import { appAuthStore } from "../../../stores";
    import type { AccountDto } from "../../../local_back/modules/accounts_service";
    import type { AppAuthStore } from "../../../stores/app_auth_store/app_auth_store";
    import { copyTextToClipboard } from "../../../core";

    let accById: AppAuthStore['byId'] = {};
    let authList: AccountDto[] = $state([]);
    let peerId = $state('');

    let selectedAcc = $state(undefined);


    function clipYourPeerId() {
      copyTextToClipboard(peerId);
    }

    
    onMount(() => {
      return appAuthStore.subscribe((newList) => {
        accById = newList.byId;
        authList = Object.values(newList.byId);
      });
    });

    $effect(() => {
      //console.log({authList});
    }); 

    function addFriend(e) {
      e.preventDefault();

    const formData = new FormData(e.target);

    const friendPeerId = formData.get('friendPeerId');
    //const password = formData.get('password');

    console.log('friendPeerId:', friendPeerId);
    //console.log('Password:', password);

      for(const [key, value] of formData.entries()) {

      console.log('myEvvvv', key, value);
      }
    }

    (async()=>{
      console.log({
        //sfdfsdf:       
        })
    })()

    function changeAcc(e: Event) {
      (async function() {
        try {
          //@ts-ignore
          //return authList[] e.target.value


           // TODO: сделать сброс что бы гонки не было при новом запросе
           peerId = await shared_worker_store.fetch({
              path: PATHS.GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P,
              body: {
                accId: 'f493910a-d8ac-46d0-9ad2-3aba98574616',
              }
            })

        }
        catch(err) {

        }
        
      })()
      //console.log('myout', e.target?.value, e.target);
    }

</script>


<ul>
    <li><h1>Добавить друга</h1></li>
    <li><Link href={ROUTES.HOME}>На главную</Link></li>
</ul>

<div>
  <select on:change={changeAcc} bind:value={selectedAcc}>
    {#each authList as acc (acc.id)}
      <option value={acc.id} >{acc.namePub}</option>
    {/each}
  </select>
  <div>
    <h3 class="mt-[0] mb-[0]">Ваш peerId</h3>
    <p class="mt-[0] mb-[0]">{peerId}</p>
    <button on:click={clipYourPeerId} type="button">Скопировать</button>
  </div>
  <form on:submit={addFriend}>
    <label>
      <span>peerId друга</span>
      <input name="friendPeerId"/>
    </label>
    <button type="submit">Добавить</button>
  </form>
  <hr/>
</div>