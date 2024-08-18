<script lang="ts">
  import { Link, ROUTES } from "../../../routing";

</script>

<div class="" data-widget-name="HomePage">
    <ul>
        <li>
            <Link href={ROUTES.ACCOUNTS}>Пользователи</Link>
        </li>
        <li>
            <Link href={ROUTES.RANDOM}>Рандом</Link>
        </li>
        <li>
            <Link href={ROUTES.AEC_ENCR}>AES</Link>
        </li>
        <li>
            <Link href={ROUTES.SETTINGS}>Настройки</Link>
        </li>
    </ul>
</div>