<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
</script>

<main class="flex-col flex gap-4 items-center justify-center min-h-screen">
  <div class="absolute top-4 left-4">
    <Link href={ROUTES.HOME}>На главную</Link>
  </div>

  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-700 mb-4">🚧</h1>
    <h2 class="text-2xl font-semibold text-gray-600 mb-2">Находится в разработке</h2>
    <p class="text-gray-500">Эта страница в настоящее время разрабатывается</p>
  </div>
</main>
