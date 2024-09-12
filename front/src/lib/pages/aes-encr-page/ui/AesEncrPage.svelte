<script>
  import { ROUTES } from "../../../routing";
  import Link from "../../../routing/ui/Link.svelte";
  import { submit_stop } from "../../../svelte-default";

</script>
<ul>
    <li><Link href={ROUTES.HOME}>Назад</Link></li>
</ul>


<form on:submit={submit_stop}>
    <div><label><div>пароль</div><textarea/></label></div>
    <div><label><div>сообщение</div><textarea/></label></div>
    <div><button><div>Зашифровать</div></button></div>
</form>