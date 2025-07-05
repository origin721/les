<script lang="ts">
    import { writable } from "svelte/store";
    import { appAuthStore } from "../../../stores";
    import { Link, ROUTES } from "../../../routing";
    import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";
    import { theme } from "../../../stores/theme";
    import AuthPageLoading from "./AuthPageLoading.svelte";
    import { devLog, prodError } from "../../../core/debug/logger";
    import { writableToState } from "../../../core/svelte_default/runs/writableToState.svelte";
    import { onMount } from 'svelte';
    import styles from "./AuthPage.module.css";

    // Svelte 5 state
    const themeState = writableToState(theme);
    const appAuthStoreState = writableToState(appAuthStore);
    
    let pass = $state<string | null>(null);
    let keyboardLayout = $state("UNKNOWN");
    let passwordInput: HTMLInputElement;
    let isLoading = $state(false);
    let loginError = $state<string | null>(null);
    let loginSuccess = $state(false);

    async function submit(e: Event) {
        if (!pass || isLoading) return;
        e.preventDefault();
        
        // Сброс предыдущих состояний
        loginError = null;
        loginSuccess = false;
        isLoading = true;
        
        devLog('AuthPage: начинается процесс аутентификации с паролем');
        
        try {
            await appAuthStore.onLogin(pass!);
            devLog('AuthPage: процесс аутентификации завершен');
            
            // Проверяем, были ли загружены аккаунты после логина
            // Добавляем небольшую задержку для обновления store
            setTimeout(() => {
                const currentAccounts = Object.keys(appAuthStoreState.state.byId);
                devLog('AuthPage: найдено аккаунтов после логина:', currentAccounts.length);
                
                if (currentAccounts.length > 0) {
                    loginSuccess = true;
                    devLog('AuthPage: аутентификация успешна, найдены аккаунты:', currentAccounts);
                    
                    // Добавляем задержку для показа успешного состояния
                    setTimeout(() => {
                        isLoading = false;
                    }, 800);
                    
                    // Автоочистка сообщения об успехе через 3 секунды
                    setTimeout(() => {
                        loginSuccess = false;
                    }, 3000);
                } else {
                    loginError = "Неверный пароль или аккаунт не найден";
                    devLog('AuthPage: аутентификация неудачна - аккаунты не найдены');
                    isLoading = false;
                    
                    // Автоочистка ошибки через 5 секунд
                    setTimeout(() => {
                        loginError = null;
                    }, 5000);
                }
            }, 300);
        } catch (error) {
            prodError('AuthPage: ошибка при аутентификации:', error);
            loginError = error instanceof Error ? error.message : "Произошла ошибка при входе";
            isLoading = false;
            
            // Автоочистка ошибки через 5 секунд
            setTimeout(() => {
                loginError = null;
            }, 5000);
        }
    }

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
        // Обработка Escape для очистки поля
        if (event.key === 'Escape') {
            pass = null;
            loginError = null;
            loginSuccess = false;
            return;
        }
        
        // Определение раскладки клавиатуры
        detectKeyboardLayout(event);
    }

    // Получаем класс индикатора в зависимости от раскладки
    function getLayoutIndicatorClass(layout: string) {
        switch (layout) {
            case "UNKNOWN": return styles.layoutUnknown;
            default: return ""; // Используем базовый стиль из CSS модуля
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
    onMount(() => {
        initKeyboardDetection();
    });
</script>

<!-- Loading Overlay -->
{#if isLoading}
    <AuthPageLoading />
{/if}

<div class="theme-{themeState.state}">
    <div class={styles.authPageContainer} data-widget-name="AuthPage">
        <header class={styles.authHeader}>
            <div class={styles.backLinkContainer}>
                {#if Object.entries(appAuthStoreState.state.byId).length}
                    <Link href={ROUTES.ACCOUNTS} className={styles.backLink}>
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
            <div class={styles.logoContainer}>
                <svg
                    class={styles.glitchSvg}
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
                        fill="var(--les-accent-primary)">AUTH.SYS</text
                    >
                    <g clip-path="url(#clip)">
                        <text
                            class="{styles.glitchLayer} {styles.layer1}"
                            x="50%"
                            y="50%"
                            dominant-baseline="middle"
                            text-anchor="middle"
                            font-family="monospace"
                            font-size="24"
                            fill="var(--les-accent-secondary)">AUTH.SYS</text
                        >
                        <text
                            class="{styles.glitchLayer} {styles.layer2}"
                            x="50%"
                            y="50%"
                            dominant-baseline="middle"
                            text-anchor="middle"
                            font-family="monospace"
                            font-size="24"
                            fill="var(--les-accent-primary)">AUTH.SYS</text
                        >
                    </g>
                </svg>
            </div>
            <div class={styles.themeSwitcherContainer}>
                <ThemeSwitcher />
            </div>
        </header>

        <main class={styles.authMain}>
            <form onsubmit={submit} class={styles.authForm}>
                <div class={styles.inputGroup}>
                    <label for="password-input">
                        <span class={styles.labelText}>[PASSWORD_REQUIRED]</span>
                    </label>
                    <div class={styles.passwordInputContainer}>
                        <input
                            id="password-input"
                            bind:this={passwordInput}
                            bind:value={pass}
                            class={styles.passwordInput}
                            type="password"
                            placeholder="> ACCESS_KEY"
                            onkeydown={handlePasswordKeydown}
                        />
                        <div class="{styles.keyboardLayoutIndicator} {getLayoutIndicatorClass(keyboardLayout)}">
                            <span class={styles.layoutText}>[{keyboardLayout}]</span>
                        </div>
                    </div>
                </div>

                <!-- Error/Success Messages -->
                {#if loginError}
                    <div class="{styles.messageContainer} {styles.errorMessage}">
                        <div class={styles.messageIcon}>⚠</div>
                        <div class={styles.messageText}>[ERROR] {loginError}</div>
                    </div>
                {/if}

                {#if loginSuccess}
                    <div class="{styles.messageContainer} {styles.successMessage}">
                        <div class={styles.messageIcon}>✓</div>
                        <div class={styles.messageText}>[ACCESS_GRANTED] Аутентификация успешна</div>
                    </div>
                {/if}

                <div class={styles.actions}>
                    <button type="submit" class={styles.submitBtn} disabled={isLoading}>
                        <span>{isLoading ? '[CONNECTING...]' : '[INITIATE_CONNECTION]'}</span>
                    </button>
                    <Link className={styles.createLink} href={ROUTES.ACCOUNTS_NEW}
                        >[CREATE_NEW_ID]</Link
                    >
                    <Link className={styles.docsLink} href={ROUTES.AUTH_DOCS}
                        >[SYSTEM_DOCUMENTATION]</Link
                    >
                    
                    <!-- Settings Link -->
                    <Link className={styles.settingsLink} href={ROUTES.SETTINGS}
                        >[SYSTEM_SETTINGS]</Link
                    >
                </div>
            </form>
        </main>

        <footer class={styles.authFooter}>
            <p>// SECURE_TERMINAL_INTERFACE //</p>
        </footer>
    </div>
</div>
