<script lang="ts">
    // TODO: файл не используется используется ./HomePage
    // Не удаляем пока но потом удалим
  import { Link, ROUTES } from "../../../routing";

</script>

<div class="" data-widget-name="HomePage">
    <ul>
        <li>
            <Link hash={ROUTES.ACCOUNTS}>Акаунты</Link>
        </li>
        <li>
            <Link hash={ROUTES.RANDOM}>Рандом</Link>
        </li>
        <li>
            <Link hash={ROUTES.CRYPTO}>Шифрование</Link>
        </li>
        <li>
            <Link hash={ROUTES.API_KEYS}>API Ключи</Link>
        </li>
        <li>
            <Link hash={ROUTES.ADD_FRIEND}>Добавить друга</Link>
        </li>
        <li>
            <Link hash={ROUTES.ADD_PEER}>Добавить пира</Link>
        </li>
        <li>
            <Link hash={ROUTES.CHAT_ROOMS}>Чаты</Link>
        </li>
        <li>
            <Link hash={ROUTES.SETTINGS}>Настройки</Link>
        </li>
    </ul>
</div>
