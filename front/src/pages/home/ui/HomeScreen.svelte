<script lang="ts">
  import { Link, ROUTES } from "../../../routing";

</script>

<div class="" data-widget-name="HomePage">
    <ul>
        <li>
            <Link href={ROUTES.ACCOUNTS}>Акаунты</Link>
        </li>
        <li>
            <Link href={ROUTES.RANDOM}>Рандом</Link>
        </li>
        <li>
            <Link href={ROUTES.CRYPTO}>Шифрование</Link>
        </li>
        <li>
            <Link href={ROUTES.API_KEYS}>API Ключи</Link>
        </li>
        <li>
            <Link href={ROUTES.ADD_FRIEND}>Добавить друга</Link>
        </li>
        <li>
            <Link href={ROUTES.CHAT_ROOMS}>Чаты</Link>
        </li>
        <li>
            <Link href={ROUTES.SETTINGS}>Настройки</Link>
        </li>
    </ul>
</div>
