<script lang="ts">
    import { writable } from "svelte/store";
    import { appAuthStore } from "../../../stores";
    import { Link, ROUTES } from "../../../routing";
    import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";
    import { theme } from "../../../stores/theme";

    // Import theme styles. The `theme` store will toggle a class on the wrapper
    // to apply the correct styles.
    import "../../../styles/cyberpunk.css";
    import "../../../styles/watchdogs.css";
    import "../../../styles/pixel.css";

    const pass = writable(null);

    function submit(e) {
        if (!pass) return;
        e.preventDefault();
        appAuthStore.onLogin($pass!);
    }
    // TODO: Доработать при добавление акаунта инфу что добавлен или ошибка
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
                    <input
                        id="password-input"
                        bind:value={$pass}
                        class="password-input"
                        type="password"
                        placeholder="> ACCESS_KEY"
                    />
                </div>

                <div class="actions">
                    <button type="submit" class="submit-btn">
                        <span>[INITIATE_CONNECTION]</span>
                    </button>
                    <Link className="create-link" href={ROUTES.ACCOUNTS_NEW}
                        >[CREATE_NEW_ID]</Link
                    >
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

    .password-input {
        width: 100%;
        background-color: var(--input-background);
        color: var(--input-text);
        border: 1px solid var(--border-color);
        padding: 0.75rem;
        font-family: inherit;
        box-sizing: border-box;
    }
    .password-input:focus {
        outline: 2px solid var(--primary-color);
        box-shadow: 0 0 10px var(--primary-color);
    }

    .actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        width: 100%;
    }

    .submit-btn,
    .create-link {
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
    .create-link:hover {
        background-color: var(--button-hover-background);
        color: var(--button-hover-text);
        box-shadow: 0 0 10px var(--button-hover-background);
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
