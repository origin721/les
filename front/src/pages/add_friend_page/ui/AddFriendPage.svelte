<script lang="ts">
    import { Link, ROUTES } from "../../../routing";
</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div class="absolute top-4 left-4">
        <Link href={ROUTES.HOME} className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            ← На главную
        </Link>
    </div>

    <div class="max-w-2xl w-full">
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">Добавить друга</h1>
            <p class="text-gray-600">Выберите способ добавления нового друга</p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
            <!-- Шифрование руками -->
            <Link href={ROUTES.ADD_FRIEND_ENCRYPTION} className="group">
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-indigo-300 transform hover:-translate-y-1">
                    <div class="text-center">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">Шифрование руками</h3>
                        <p class="text-gray-600 text-sm">Ручное шифрование данных для безопасного обмена</p>
                    </div>
                </div>
            </Link>

            <!-- peerToPeerId -->
            <Link href={ROUTES.ADD_FRIEND_PEER_TO_PEER} className="group">
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-indigo-300 transform hover:-translate-y-1">
                    <div class="text-center">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">peerToPeerId</h3>
                        <p class="text-gray-600 text-sm">Прямое соединение между устройствами</p>
                    </div>
                </div>
            </Link>

            <!-- SSE -->
            <Link href={ROUTES.ADD_FRIEND_SSE} className="group">
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-indigo-300 transform hover:-translate-y-1">
                    <div class="text-center">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">SSE</h3>
                        <p class="text-gray-600 text-sm">Server-Sent Events для реального времени</p>
                    </div>
                </div>
            </Link>
        </div>

        <div class="mt-8 text-center">
            <p class="text-gray-500 text-sm">Выберите подходящий метод для добавления друга в зависимости от ваших потребностей безопасности</p>
        </div>
    </div>
</main>
