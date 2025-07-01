<script lang="ts">
    import { writable } from "svelte/store";
    import { appAuthStore } from "../../../stores";
    import { Link, ROUTES } from "../../../routing";
    import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";
    import { theme } from "../../../stores/theme";
    import { clearAllAppData, clearServiceWorkersOnly, clearStorageOnly, clearIndexedDBOnly } from "../../../core/clear_app_data";

    // Import theme styles. The `theme` store will toggle a class on the wrapper
    // to apply the correct styles.
    import "../../../styles/cyberpunk.css";
    import "../../../styles/watchdogs.css";
    import "../../../styles/pixel.css";

    const pass = writable(null);
    let showClearOptions = false;
    let keyboardLayout = "UNKNOWN";
    let passwordInput: HTMLInputElement;

    function submit(e: Event) {
        if (!pass) return;
        e.preventDefault();
        appAuthStore.onLogin($pass!);
    }

    function toggleClearOptions() {
        showClearOptions = !showClearOptions;
    }

    async function handleClearAll() {
        if (confirm('Вы уверены, что хотите очистить ВСЕ данные приложения? Это действие нельзя отменить.')) {
            await clearAllAppData();
        }
    }

    async function handleClearServiceWorkers() {
        if (confirm('Очистить только Service Workers?')) {
            await clearServiceWorkersOnly();
        }
    }

    function handleClearStorage() {
        if (confirm('Очистить только локальное хранилище?')) {
            clearStorageOnly();
        }
    }

    async function handleClearIndexedDB() {
        if (confirm('Очистить только IndexedDB базы данных?')) {
            await clearIndexedDBOnly();
        }
    }
    // TODO: Доработать при добавление акаунта инфу что добавлен или ошибка

    // Функция для определения раскладки клавиатуры
    function detectKeyboardLayout(event: KeyboardEvent) {
        const key = event.key;
        const code = event.code;
        
        // Определяем раскладку по характерным символам
        if (key.match(/[а-яё]/i)) {
            keyboardLayout = "RU";
        } else if (key.match(/[a-z]/i)) {
            keyboardLayout = "EN";
        } else if (key.match(/[ążśćęłńóź]/i)) {
            keyboardLayout = "PL";
        } else if (key.match(/[äöüß]/i)) {
            keyboardLayout = "DE";
        } else if (key.match(/[àáâäèéêëîïôûüÿç]/i)) {
            keyboardLayout = "FR";
        } else if (key.match(/[àáèéìíîïòóùú]/i)) {
            keyboardLayout = "IT";
        } else if (key.match(/[ñáéíóúü]/i)) {
            keyboardLayout = "ES";
        } else if (key === "Backspace" || key === "Delete" || key === "Tab" || key === "Enter") {
            // Не изменяем раскладку для служебных клавиш
            return;
        }
        
        // Дополнительное определение по позиции клавиш
        if (keyboardLayout === "UNKNOWN" && key.length === 1) {
            // Анализируем по коду клавиши и символу
            switch (code) {
                case "KeyQ":
                    if (key === "й") keyboardLayout = "RU";
                    else if (key === "q") keyboardLayout = "EN";
                    break;
                case "KeyW":
                    if (key === "ц") keyboardLayout = "RU";
                    else if (key === "w") keyboardLayout = "EN";
                    break;
                case "KeyE":
                    if (key === "у") keyboardLayout = "RU";
                    else if (key === "e") keyboardLayout = "EN";
                    break;
                case "KeyR":
                    if (key === "к") keyboardLayout = "RU";
                    else if (key === "r") keyboardLayout = "EN";
                    break;
                case "KeyT":
                    if (key === "е") keyboardLayout = "RU";
                    else if (key === "t") keyboardLayout = "EN";
                    break;
            }
        }
    }

    // Обработчик события ввода в поле пароля
    function handlePasswordKeydown(event: KeyboardEvent) {
        detectKeyboardLayout(event);
    }

    // Получаем цвет индикатора в зависимости от раскладки
    function getLayoutIndicatorClass(layout: string) {
        switch (layout) {
            case "RU": return "layout-ru";
            case "EN": return "layout-en";
            case "PL": return "layout-pl";
            case "DE": return "layout-de";
            case "FR": return "layout-fr";
            case "IT": return "layout-it";
            case "ES": return "layout-es";
            default: return "layout-unknown";
        }
    }

    // Инициализация определения раскладки при монтировании компонента
    function initKeyboardDetection() {
        if (typeof navigator !== 'undefined' && 'keyboard' in navigator) {
            // Современный API для определения раскладки (если доступен)
            const keyboard = (navigator as any).keyboard;
            if (keyboard && 'getLayoutMap' in keyboard) {
                keyboard.getLayoutMap().then((layoutMap: any) => {
                    const qKey = layoutMap.get('KeyQ');
                    if (qKey === 'й') {
                        keyboardLayout = "RU";
                    } else if (qKey === 'q') {
                        keyboardLayout = "EN";
                    }
                }).catch(() => {
                    // Если API недоступен, используем обработчик событий
                    keyboardLayout = "UNKNOWN";
                });
            }
        }
    }

    // Вызываем инициализацию при монтировании
    import { onMount } from 'svelte';
    onMount(() => {
        initKeyboardDetection();
    });
</script>

<div class="theme-{$theme}">
    <div class="auth-page-container" data-widget-name="AuthPage">
        <header class="auth-header">
            <div class="back-link-container">
                {#if Object.entries($appAuthStore.byId).length}
                    <Link href={ROUTES.ACCOUNTS} className="back-link">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path d="M19 12H5M12 19l-7-7 7-7" /></svg
                        >
                        <span>SYS.MAIN</span>
                    </Link>
                {/if}
            </div>
            <div class="logo-container">
                <svg
                    class="glitch-svg"
                    viewBox="0 0 200 60"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <clipPath id="clip">
                            <rect x="0" y="0" width="200" height="60" />
                        </clipPath>
                    </defs>
                    <text
                        x="50%"
                        y="50%"
                        dominant-baseline="middle"
                        text-anchor="middle"
                        font-family="monospace"
                        font-size="24"
                        fill="var(--primary-color)">AUTH.SYS</text
                    >
                    <g clip-path="url(#clip)">
                        <text
                            class="glitch-layer layer1"
                            x="50%"
                            y="50%"
                            dominant-baseline="middle"
                            text-anchor="middle"
                            font-family="monospace"
                            font-size="24"
                            fill="var(--secondary-color)">AUTH.SYS</text
                        >
                        <text
                            class="glitch-layer layer2"
                            x="50%"
                            y="50%"
                            dominant-baseline="middle"
                            text-anchor="middle"
                            font-family="monospace"
                            font-size="24"
                            fill="var(--primary-color)">AUTH.SYS</text
                        >
                    </g>
                </svg>
            </div>
            <div class="theme-switcher-container">
                <ThemeSwitcher />
            </div>
        </header>

        <main class="auth-main">
            <form onsubmit={submit} class="auth-form">
                <div class="input-group">
                    <label for="password-input">
                        <span class="label-text">[PASSWORD_REQUIRED]</span>
                    </label>
                    <div class="password-input-container">
                        <input
                            id="password-input"
                            bind:this={passwordInput}
                            bind:value={$pass}
                            class="password-input"
                            type="password"
                            placeholder="> ACCESS_KEY"
                            onkeydown={handlePasswordKeydown}
                        />
                        <div class="keyboard-layout-indicator {getLayoutIndicatorClass(keyboardLayout)}">
                            <span class="layout-text">[{keyboardLayout}]</span>
                        </div>
                    </div>
                </div>

                <div class="actions">
                    <button type="submit" class="submit-btn">
                        <span>[INITIATE_CONNECTION]</span>
                    </button>
                    <Link className="create-link" href={ROUTES.ACCOUNTS_NEW}
                        >[CREATE_NEW_ID]</Link
                    >
                    <Link className="docs-link" href={ROUTES.AUTH_DOCS}
                        >[SYSTEM_DOCUMENTATION]</Link
                    >
                    
                    <!-- Clear Data Section -->
                    <div class="clear-section">
                        <button 
                            type="button" 
                            class="clear-toggle-btn" 
                            onclick={toggleClearOptions}
                        >
                            {showClearOptions ? '[HIDE_CLEAR_OPTIONS]' : '[CLEAR_APP_DATA]'}
                        </button>
                        
                        {#if showClearOptions}
                            <div class="clear-options">
                                <button 
                                    type="button" 
                                    class="clear-btn clear-all" 
                                    onclick={handleClearAll}
                                >
                                    [CLEAR_ALL_DATA]
                                </button>
                                <button 
                                    type="button" 
                                    class="clear-btn clear-sw" 
                                    onclick={handleClearServiceWorkers}
                                >
                                    [CLEAR_SERVICE_WORKERS]
                                </button>
                                <button 
                                    type="button" 
                                    class="clear-btn clear-storage" 
                                    onclick={handleClearStorage}
                                >
                                    [CLEAR_STORAGE]
                                </button>
                                <button 
                                    type="button" 
                                    class="clear-btn clear-indexeddb" 
                                    onclick={handleClearIndexedDB}
                                >
                                    [CLEAR_INDEXEDDB]
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            </form>
        </main>

        <footer class="auth-footer">
            <p>// SECURE_TERMINAL_INTERFACE //</p>
        </footer>
    </div>
</div>

<style>
    /* Apply a theme-specific class to the root of the component */
    .theme-cyberpunk {
        --background-color: #0a0a0a;
        --text-color: #00ff00;
        --primary-color: #ff00ff;
        --secondary-color: #00ffff;
        --border-color: #00ff00;
        --input-background: #1a1a1a;
        --input-text: #00ff00;
        --button-background: transparent;
        --button-text: #00ff00;
        --button-hover-background: #00ff00;
        --button-hover-text: #0a0a0a;
        --link-color: #00ffff;
        --link-hover-color: #ff00ff;
    }
    .theme-watchdogs {
        --background-color: #1a1a1a;
        --text-color: #cccccc;
        --primary-color: #ffc400;
        --secondary-color: #00aaff;
        --border-color: #444444;
        --input-background: #222222;
        --input-text: #dddddd;
        --button-background: #ffc400;
        --button-text: #1a1a1a;
        --button-hover-background: #00aaff;
        --button-hover-text: #ffffff;
        --link-color: #00aaff;
        --link-hover-color: #ffc400;
    }
    .theme-pixel {
        --background-color: #000000;
        --text-color: #00ff00;
        --primary-color: #00ff00;
        --secondary-color: #ff00ff;
        --border-color: #00ff00;
        --input-background: #222222;
        --input-text: #00ff00;
        --button-background: #00ff00;
        --button-text: #000000;
        --button-hover-background: #ff00ff;
        --button-hover-text: #000000;
        --link-color: #00ff00;
        --link-hover-color: #ff00ff;
    }

    .auth-page-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100vh;
        width: 100vw;
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: "Courier New", Courier, monospace;
        padding: 1rem;
        overflow: hidden;
        border: 2px solid var(--border-color);
        box-shadow: 0 0 25px var(--primary-color) inset;
        box-sizing: border-box;
    }

    .auth-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
        min-height: 60px;
    }

    .back-link-container,
    .theme-switcher-container {
        flex: 1;
    }
    .theme-switcher-container {
        display: flex;
        justify-content: flex-end;
    }

    .back-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--link-color);
        text-decoration: none;
        transition: all 0.2s;
    }
    .back-link:hover {
        color: var(--link-hover-color);
        text-shadow: 0 0 5px var(--link-hover-color);
    }

    .logo-container {
        flex: 2;
        display: flex;
        justify-content: center;
    }

    .glitch-svg {
        width: 100%;
        max-width: 300px;
        height: auto;
    }

    .glitch-layer {
        animation: glitch 2.5s infinite steps(1);
    }

    .layer1 {
        animation-delay: 0.6s;
    }

    .layer2 {
        animation-delay: 1.2s;
        opacity: 0.8;
    }

    @keyframes glitch {
        0% {
            transform: translate(0, 0);
        }
        10% {
            transform: translate(-3px, 3px);
        }
        20% {
            transform: translate(3px, -3px);
        }
        30% {
            transform: translate(-3px, -3px);
        }
        40% {
            transform: translate(3px, 3px);
        }
        50% {
            transform: translate(0, 0);
        }
        100% {
            transform: translate(0, 0);
        }
    }

    .auth-main {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 400px;
        padding: 2rem;
        border: 1px solid var(--border-color);
        background: #00000033;
    }

    .input-group {
        width: 100%;
        margin-bottom: 1.5rem;
    }

    .label-text {
        display: block;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        font-size: 0.9rem;
        letter-spacing: 0.1em;
    }

    .password-input-container {
        position: relative;
        width: 100%;
    }

    .password-input {
        width: 100%;
        background-color: var(--input-background);
        color: var(--input-text);
        border: 1px solid var(--border-color);
        padding: 0.75rem;
        padding-right: 4rem; /* Место для индикатора */
        font-family: inherit;
        box-sizing: border-box;
    }
    .password-input:focus {
        outline: 2px solid var(--primary-color);
        box-shadow: 0 0 10px var(--primary-color);
    }

    .keyboard-layout-indicator {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--border-color);
        background-color: var(--input-background);
        border-radius: 3px;
        font-size: 0.7rem;
        font-weight: bold;
        letter-spacing: 0.05em;
        min-width: 2rem;
        text-align: center;
        transition: all 0.2s ease;
        pointer-events: none;
    }

    .layout-text {
        display: block;
        white-space: nowrap;
    }

    /* Цвета для разных раскладок */
    .layout-ru {
        color: #ff6b6b;
        border-color: #ff6b6b;
        text-shadow: 0 0 3px #ff6b6b;
    }

    .layout-en {
        color: #51cf66;
        border-color: #51cf66;
        text-shadow: 0 0 3px #51cf66;
    }

    .layout-pl {
        color: #ff8cc8;
        border-color: #ff8cc8;
        text-shadow: 0 0 3px #ff8cc8;
    }

    .layout-de {
        color: #ffd43b;
        border-color: #ffd43b;
        text-shadow: 0 0 3px #ffd43b;
    }

    .layout-fr {
        color: #74c0fc;
        border-color: #74c0fc;
        text-shadow: 0 0 3px #74c0fc;
    }

    .layout-it {
        color: #69db7c;
        border-color: #69db7c;
        text-shadow: 0 0 3px #69db7c;
    }

    .layout-es {
        color: #ffa8a8;
        border-color: #ffa8a8;
        text-shadow: 0 0 3px #ffa8a8;
    }

    .layout-unknown {
        color: var(--text-color);
        border-color: var(--border-color);
        opacity: 0.6;
    }

    /* Анимация при изменении раскладки */
    .keyboard-layout-indicator {
        animation: layoutChange 0.3s ease;
    }

    @keyframes layoutChange {
        0% {
            transform: translateY(-50%) scale(1);
        }
        50% {
            transform: translateY(-50%) scale(1.1);
        }
        100% {
            transform: translateY(-50%) scale(1);
        }
    }

    .actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        width: 100%;
    }

    .submit-btn,
    .create-link,
    .docs-link {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        background-color: var(--button-background);
        color: var(--button-text);
        text-transform: uppercase;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        transition: all 0.2s ease-in-out;
        box-sizing: border-box;
    }

    .submit-btn:hover,
    .create-link:hover,
    .docs-link:hover {
        background-color: var(--button-hover-background);
        color: var(--button-hover-text);
        box-shadow: 0 0 10px var(--button-hover-background);
    }

    .docs-link {
        background-color: transparent;
        border-style: dashed;
        opacity: 0.8;
    }

    .docs-link:hover {
        opacity: 1;
        border-style: solid;
    }

    /* Clear data section styles */
    .clear-section {
        width: 100%;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
    }

    .clear-toggle-btn {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        background-color: transparent;
        color: var(--text-color);
        text-transform: uppercase;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s ease-in-out;
        box-sizing: border-box;
        font-size: 0.8rem;
        opacity: 0.7;
    }

    .clear-toggle-btn:hover {
        opacity: 1;
        border-color: var(--primary-color);
        color: var(--primary-color);
        text-shadow: 0 0 5px var(--primary-color);
    }

    .clear-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
        animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .clear-btn {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        background-color: transparent;
        color: var(--text-color);
        text-transform: uppercase;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s ease-in-out;
        box-sizing: border-box;
        font-size: 0.75rem;
        opacity: 0.8;
    }

    .clear-btn:hover {
        opacity: 1;
        text-shadow: 0 0 3px currentColor;
    }

    .clear-all {
        border-color: #ff4444;
        color: #ff4444;
    }

    .clear-all:hover {
        background-color: #ff4444;
        color: #000000;
        box-shadow: 0 0 10px #ff4444;
    }

    .clear-sw {
        border-color: #ffaa00;
        color: #ffaa00;
    }

    .clear-sw:hover {
        background-color: #ffaa00;
        color: #000000;
        box-shadow: 0 0 10px #ffaa00;
    }

    .clear-storage {
        border-color: #44ff44;
        color: #44ff44;
    }

    .clear-storage:hover {
        background-color: #44ff44;
        color: #000000;
        box-shadow: 0 0 10px #44ff44;
    }

    .clear-indexeddb {
        border-color: #8844ff;
        color: #8844ff;
    }

    .clear-indexeddb:hover {
        background-color: #8844ff;
        color: #000000;
        box-shadow: 0 0 10px #8844ff;
    }

    .auth-footer {
        width: 100%;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
        text-align: center;
        font-size: 0.8rem;
    }

    /* Responsive adjustments */
    @media (max-width: 48rem) {
        /* --tablet */
        .auth-header {
            flex-direction: column;
            gap: 1rem;
        }
        .logo-container {
            order: -1;
        }
        .back-link-container,
        .theme-switcher-container {
            width: 100%;
            flex: none;
        }
        .back-link-container {
            justify-content: flex-start;
        }
    }
</style>
