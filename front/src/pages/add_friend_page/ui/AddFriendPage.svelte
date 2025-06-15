<script lang="ts">
    import { Link, ROUTES } from "../../../routing";

    function addFriend(e) {
      e.preventDefault();
    }

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