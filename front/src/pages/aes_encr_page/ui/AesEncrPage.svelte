<script>
  import { ROUTES } from "../../../routing";
  import Link from "../../../routing/ui/Link.svelte";
  import { submit_stop } from "../../../core/svelte_default";
// TODO: deprecated не используется

</script>
<ul>
    <li><Link hash={ROUTES.HOME}>Назад</Link></li>
</ul>


<form onsubmit={submit_stop}>
    <div><label><div>пароль</div><textarea></textarea></label></div>
    <div><label><div>сообщение</div><textarea></textarea></label></div>
    <div><button><div>Зашифровать</div></button></div>
</form>