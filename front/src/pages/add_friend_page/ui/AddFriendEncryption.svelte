<script lang="ts">
    import { Link, ROUTES } from "../../../routing";
</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-6">
    <div class="absolute top-4 left-4">
        <Link href={ROUTES.ADD_FRIEND} className="text-purple-600 hover:text-purple-800 font-medium transition-colors">
            ← Назад к выбору способа
        </Link>
    </div>

    <div class="max-w-2xl w-full">
        <div class="text-center mb-8">
            <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">Шифрование руками</h1>
            <p class="text-gray-600">Ручное шифрование данных для безопасного добавления друга</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Описание метода</h3>
                    <p class="text-gray-600">
                        Этот метод позволяет вручную шифровать данные друга для максимальной безопасности. 
                        Вы сами контролируете процесс шифрования и можете использовать собственные ключи.
                    </p>
                </div>

                <div class="border-t pt-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Форма добавления</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Имя друга</label>
                            <input 
                                type="text" 
                                placeholder="Введите имя друга"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Публичный ключ</label>
                            <textarea 
                                placeholder="Вставьте публичный ключ друга"
                                rows="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            ></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Алгоритм шифрования</label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="curve25519">Curve25519</option>
                                <option value="rsa">RSA</option>
                                <option value="aes">AES</option>
                            </select>
                        </div>

                        <button class="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-md hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium">
                            Добавить друга
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6 text-center">
            <p class="text-gray-500 text-sm">Убедитесь, что публичный ключ получен из надежного источника</p>
        </div>
    </div>
</main>
