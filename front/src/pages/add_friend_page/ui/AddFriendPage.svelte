<script lang="ts">
    import { PATHS } from "../../../local_back";
    import { shared_worker_store } from "../../../processes";
    import { Link, ROUTES } from "../../../routing";

    function addFriend(e) {
      e.preventDefault();
    }

    (async()=>{
      console.log({
        sfdfsdf: await shared_worker_store.fetch({
          path: PATHS.GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P,
          body: {
            accId: 'f493910a-d8ac-46d0-9ad2-3aba98574616',
          }
      })
      })
    })()

</script>


<ul>
    <li><h1>Добавить друга</h1></li>
    <li><Link href={ROUTES.HOME}>На главную</Link></li>
</ul>

<div>
  <form on:submit={addFriend}>
    <label>
      <span>peerId друга</span>
      <input/>
    </label>
    <button type="submit">Добавить</button>
  </form>
  <hr/>
  <div>
    <h3 class="mt-[0] mb-[0]">Ваш peerId</h3>
    <p class="mt-[0] mb-[0]">sfdjoisfdsjoidsdifojsdiojsdf</p>
    <button>Скопировать</button>
  </div>
</div>