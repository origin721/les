<script lang="ts">
    import { writable } from "svelte/store";
    import { appAuthStore } from "../../../stores";
    import { Link, ROUTES } from "../../../routing";
    import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";
    import { theme } from "../../../stores/theme";
    import AuthPageLoading from "./AuthPageLoading.svelte";
    import { devLog, prodError } from "../../../core/debug/logger";
    import { writableToState } from "../../../core/svelte_default/runs/writableToState.svelte";
    import { onMount } from "svelte";
    import styles from "./AuthPage.module.css";

    // Импортируем переводы
    //import { langViewPage } from "../stores/lang/ru";
    import { authLangStore } from "../stores";

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

        devLog("AuthPage: начинается процесс аутентификации с паролем");

        try {
            await appAuthStore.onLogin(pass!);
            devLog("AuthPage: процесс аутентификации завершен");

            setTimeout(() => {
                const currentAccounts = Object.keys(
                    appAuthStoreState.state.byId,
                );
                devLog(
                    "AuthPage: найдено аккаунтов после логина:",
                    currentAccounts.length,
                );

                if (currentAccounts.length > 0) {
                    loginSuccess = true;
                    devLog(
                        "AuthPage: аутентификация успешна, найдены аккаунты:",
                        currentAccounts,
                    );

                    setTimeout(() => {
                        isLoading = false;
                    }, 800);

                    setTimeout(() => {
                        loginSuccess = false;
                    }, 3000);
                } else {
                    loginError = authLangStore.config.loginFailedAccountsNotFound;
                    devLog(
                        "AuthPage: аутентификация неудачна - аккаунты не найдены",
                    );
                    isLoading = false;

                    setTimeout(() => {
                        loginError = null;
                    }, 5000);
                }
            }, 300);
        } catch (error) {
            prodError("AuthPage: ошибка при аутентификации:", error);
            loginError =
                error instanceof Error
                    ? error.message
                    : authLangStore.config.loginFailedGeneral;
            isLoading = false;

            setTimeout(() => {
                loginError = null;
            }, 5000);
        }
    }

    function detectKeyboardLayout(event: KeyboardEvent) {
        const key = event.key;
        const code = event.code;

        if (key.match(/[а-яё]/i)) {
            keyboardLayout = authLangStore.config.keyboardLayoutRu;
        } else if (key.match(/[a-z]/i)) {
            keyboardLayout = authLangStore.config.keyboardLayoutEn;
        } else if (key.match(/[ążśćęłńóź]/i)) {
            keyboardLayout = authLangStore.config.keyboardLayoutPl;
        } else if (key.match(/[äöüß]/i)) {
            keyboardLayout = authLangStore.config.keyboardLayoutDe;
        } else if (key.match(/[àáâäèéêëîïôûüÿç]/i)) {
            keyboardLayout = authLangStore.config.keyboardLayoutFr;
        } else if (key.match(/[àáèéìíîïòóùú]/i)) {
            keyboardLayout = authLangStore.config.keyboardLayoutIt;
        } else if (key.match(/[ñáéíóúü]/i)) {
            keyboardLayout = authLangStore.config.keyboardLayoutEs;
        } else if (
            key === "Backspace" ||
            key === "Delete" ||
            key === "Tab" ||
            key === "Enter"
        ) {
            return;
        }

        if (keyboardLayout === authLangStore.config.keyboardLayoutUnknown && key.length === 1) {
            switch (code) {
                case "KeyQ":
                    if (key === "й") keyboardLayout = authLangStore.config.keyboardLayoutRu;
                    else if (key === "q") keyboardLayout = authLangStore.config.keyboardLayoutEn;
                    break;
                case "KeyW":
                    if (key === "ц") keyboardLayout = authLangStore.config.keyboardLayoutRu;
                    else if (key === "w") keyboardLayout = authLangStore.config.keyboardLayoutEn;
                    break;
                case "KeyE":
                    if (key === "у") keyboardLayout = authLangStore.config.keyboardLayoutRu;
                    else if (key === "e") keyboardLayout = authLangStore.config.keyboardLayoutEn;
                    break;
                case "KeyR":
                    if (key === "к") keyboardLayout = authLangStore.config.keyboardLayoutRu;
                    else if (key === "r") keyboardLayout = authLangStore.config.keyboardLayoutEn;
                    break;
                case "KeyT":
                    if (key === "е") keyboardLayout = authLangStore.config.keyboardLayoutRu;
                    else if (key === "t") keyboardLayout = authLangStore.config.keyboardLayoutEn;
                    break;
            }
        }
    }

    function handlePasswordKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            pass = null;
            loginError = null;
            loginSuccess = false;
            return;
        }
        detectKeyboardLayout(event);
    }

    function getLayoutIndicatorClass(layout: string) {
        switch (layout) {
            case authLangStore.config.keyboardLayoutUnknown:
                return styles.layoutUnknown;
            default:
                return "";
        }
    }

    function initKeyboardDetection() {
        if (typeof navigator !== "undefined" && "keyboard" in navigator) {
            const keyboard = (navigator as any).keyboard;
            if (keyboard && "getLayoutMap" in keyboard) {
                keyboard
                    .getLayoutMap()
                    .then((layoutMap: any) => {
                        const qKey = layoutMap.get("KeyQ");
                        if (qKey === "й") {
                            keyboardLayout = authLangStore.config.keyboardLayoutRu;
                        } else if (qKey === "q") {
                            keyboardLayout = authLangStore.config.keyboardLayoutEn;
                        }
                    })
                    .catch(() => {
                        keyboardLayout = authLangStore.config.keyboardLayoutUnknown;
                    });
            }
        }
    }

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
                        <span>{authLangStore.config.backToAccounts}</span>
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
                        fill="var(--les-accent-primary)">{authLangStore.config.systemLogo}</text
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
                            fill="var(--les-accent-secondary)">{authLangStore.config.systemLogo}</text
                        >
                        <text
                            class="{styles.glitchLayer} {styles.layer2}"
                            x="50%"
                            y="50%"
                            dominant-baseline="middle"
                            text-anchor="middle"
                            font-family="monospace"
                            font-size="24"
                            fill="var(--les-accent-primary)">{authLangStore.config.systemLogo}</text
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
                        <span class={styles.labelText}>{authLangStore.config.passwordRequired}</span>
                    </label>
                    <div class={styles.passwordInputContainer}>
                        <input
                            id="password-input"
                            bind:this={passwordInput}
                            bind:value={pass}
                            class={styles.passwordInput}
                            type="password"
                            placeholder={authLangStore.config.accessKeyPlaceholder}
                            onkeydown={handlePasswordKeydown}
                        />
                        <div
                            class="{styles.keyboardLayoutIndicator} {getLayoutIndicatorClass(
                                keyboardLayout,
                            )}"
                        >
                            <span class={styles.layoutText}
                                >[{keyboardLayout}]</span
                            >
                        </div>
                    </div>
                </div>

                <!-- Error/Success Messages -->
                {#if loginError}
                    <div
                        class="{styles.messageContainer} {styles.errorMessage}"
                    >
                        <div class={styles.messageIcon}>⚠</div>
                        <div class={styles.messageText}>
                            {authLangStore.config.error} {loginError}
                        </div>
                    </div>
                {/if}

                {#if loginSuccess}
                    <div
                        class="{styles.messageContainer} {styles.successMessage}"
                    >
                        <div class={styles.messageIcon}>✓</div>
                        <div class={styles.messageText}>
                            {authLangStore.config.success}
                        </div>
                    </div>
                {/if}

                <div class={styles.actions}>
                    <button
                        type="submit"
                        class={styles.submitBtn}
                        disabled={isLoading}
                    >
                        <span
                            >{isLoading
                                ? authLangStore.config.connecting
                                : authLangStore.config.initiateConnection}</span
                        >
                    </button>
                    <Link
                        className={styles.createLink}
                        href={ROUTES.ACCOUNTS_NEW}>{authLangStore.config.createNewId}</Link
                    >
                    <Link className={styles.docsLink} href={ROUTES.DOCS}
                        >{authLangStore.config.systemDocumentation}</Link
                    >

                    <!-- Settings Link -->
                    <Link className={styles.settingsLink} href={ROUTES.SETTINGS}
                        >{authLangStore.config.systemSettings}</Link
                    >
                </div>
            </form>
        </main>

        <footer class={styles.authFooter}>
            <p>{authLangStore.config.secureTerminalInterface}</p>
        </footer>
    </div>
</div>
