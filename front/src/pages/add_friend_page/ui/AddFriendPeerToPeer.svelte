<script lang="ts">
    import { Link, ROUTES } from "../../../routing";
</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
    <div class="absolute top-4 left-4">
        <Link href={ROUTES.ADD_FRIEND} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            ← Назад к выбору способа
        </Link>
    </div>

    <div class="max-w-2xl w-full">
        <div class="text-center mb-8">
            <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">peerToPeerId</h1>
            <p class="text-gray-600">Прямое P2P соединение между устройствами</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Описание метода</h3>
                    <p class="text-gray-600">
                        Peer-to-peer соединение обеспечивает прямую связь между устройствами без промежуточных серверов.
                        Использует libp2p для установления безопасного соединения.
                    </p>
                </div>

                <div class="border-t pt-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Настройка соединения</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Peer ID друга</label>
                            <input 
                                type="text" 
                                placeholder="Введите Peer ID (например: 12D3KooW...)"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                            />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Multiaddress</label>
                            <textarea 
                                placeholder="/ip4/192.168.1.100/tcp/4001/p2p/12D3KooW..."
                                rows="3"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                            ></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Протокол</label>
                                <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="tcp">TCP</option>
                                    <option value="websocket">WebSocket</option>
                                    <option value="webrtc">WebRTC</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Порт</label>
                                <input 
                                    type="number" 
                                    placeholder="4001"
                                    min="1"
                                    max="65535"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div class="flex items-center space-x-2">
                            <input type="checkbox" id="relay" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                            <label for="relay" class="text-sm text-gray-700">Использовать relay серверы</label>
                        </div>

                        <button class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium">
                            Установить соединение
                        </button>
                    </div>
                </div>

                <div class="border-t pt-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Статус соединения</h3>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <span class="text-gray-600">Не подключено</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6 text-center">
            <p class="text-gray-500 text-sm">Убедитесь, что устройства находятся в одной сети или доступны через интернет</p>
        </div>
    </div>
</main>
