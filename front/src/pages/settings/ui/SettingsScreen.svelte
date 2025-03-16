<script>
// @ts-nocheck


  import { ROUTES, Link } from "../../../routing";
  import {clearAllLocalStorage} from '../../../core';

</script>
<div class="" data-widget-name="HomePage">
    <ul>
        <li>
            <Link href={ROUTES.HOME}>Назад</Link>
        </li>
        <li>
            <button onclick={clearAllLocalStorage}>onClearLocalStorage</button>
        </li>
    </ul>
</div>