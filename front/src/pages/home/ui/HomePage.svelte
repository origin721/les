<script lang="ts">
    import { Link, ROUTES } from "../../../routing";
    import { theme } from "../../../stores/theme";
    import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";

    // Import theme styles
    import "../../../styles/cyberpunk.css";
    import "../../../styles/watchdogs.css";
    import "../../../styles/pixel.css";

    const menuItems = [
        { href: ROUTES.ACCOUNTS, title: "АККАУНТЫ", icon: "👤", description: "Управление пользователями" },
        { href: ROUTES.CRYPTO, title: "ШИФРОВАНИЕ", icon: "🔐", description: "Криптографические операции" },
        { href: ROUTES.API_KEYS, title: "API КЛЮЧИ", icon: "🔑", description: "Управление ключами доступа" },
        { href: ROUTES.CHAT_ROOMS, title: "ЧАТЫ", icon: "💬", description: "Безопасные сообщения" },
        { href: ROUTES.ADD_FRIEND, title: "ДОБАВИТЬ ДРУГА", icon: "👥", description: "Расширить сеть контактов" },
        { href: ROUTES.RANDOM, title: "РАНДОМ", icon: "🎲", description: "Генерация случайных данных" },
        { href: ROUTES.SETTINGS, title: "НАСТРОЙКИ", icon: "⚙️", description: "Конфигурация системы" },
        { href: ROUTES.AUTH_DOCS, title: "ДОКУМЕНТАЦИЯ", icon: "📋", description: "Техническая информация" }
    ];
</script>

<div class="theme-{$theme}">
    <div class="home-container" data-widget-name="HomePage">
        <header class="home-header">
            <div class="animated-title-container">
                <div class="matrix-rain">
                    {#each Array(15) as _, i}
                        <div class="matrix-column" style="animation-delay: {i * 0.15}s;">
                            {#each Array(8) as _, j}
                                <span class="matrix-char" style="animation-delay: {(i * 0.15) + (j * 0.08)}s;">
                                    {String.fromCharCode(48 + Math.floor(Math.random() * 10))}
                                </span>
                            {/each}
                        </div>
                    {/each}
                </div>
                
                <h1 class="animated-title">
                    <span class="title-word glitch-word" style="animation-delay: 0s;">SECURE</span>
                    <span class="title-separator">_</span>
                    <span class="title-word glitch-word" style="animation-delay: 0.4s;">MESSAGE</span>
                    <span class="title-separator">_</span>
                    <span class="title-word glitch-word" style="animation-delay: 0.8s;">SYSTEM</span>
                </h1>
                
                <div class="subtitle">
                    <span class="typing-text">ГЛАВНОЕ_МЕНЮ_СИСТЕМЫ_БЕЗОПАСНОСТИ</span>
                    <span class="cursor">█</span>
                </div>
                
                <div class="status-indicator">
                    <span class="status-dot active"></span>
                    <span class="status-text">СИСТЕМА АКТИВНА</span>
                </div>
            </div>

            <div class="theme-switcher-container">
                <ThemeSwitcher />
            </div>
        </header>

        <main class="home-content">
            <div class="menu-grid">
                {#each menuItems as item}
                    <Link href={item.href} className="menu-card">
                        <div class="menu-icon">{item.icon}</div>
                        <h3 class="menu-title">{item.title}</h3>
                        <p class="menu-description">{item.description}</p>
                        <div class="menu-arrow">→</div>
                    </Link>
                {/each}
            </div>
        </main>

        <footer class="home-footer">
            <div class="footer-info">
                <span class="footer-version">// SECURE_MESSAGE_TERMINAL_v0.1.0 //</span>
                <span class="footer-status">STATUS: OPERATIONAL</span>
            </div>
        </footer>
    </div>
</div>

<style>
    /* Theme Variables */
    .theme-cyberpunk {
        --background-color: #0a0a0a;
        --text-color: #00ff00;
        --primary-color: #ff00ff;
        --secondary-color: #00ffff;
        --border-color: #00ff00;
        --card-background: #1a1a1a;
        --nav-active: #ff00ff;
        --accent-color: #ffff00;
    }
    
    .theme-watchdogs {
        --background-color: #1a1a1a;
        --text-color: #cccccc;
        --primary-color: #ffc400;
        --secondary-color: #00aaff;
        --border-color: #444444;
        --card-background: #222222;
        --nav-active: #ffc400;
        --accent-color: #00aaff;
    }
    
    .theme-pixel {
        --background-color: #000000;
        --text-color: #00ff00;
        --primary-color: #00ff00;
        --secondary-color: #ff00ff;
        --border-color: #00ff00;
        --card-background: #222222;
        --nav-active: #ff00ff;
        --accent-color: #00ff00;
    }

    .home-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        width: 100vw;
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: "Courier New", Courier, monospace;
        overflow-x: hidden;
        border: 2px solid var(--border-color);
        box-shadow: 0 0 25px var(--primary-color) inset;
    }

    /* Header */
    .home-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem;
        border-bottom: 1px solid var(--border-color);
        min-height: 200px;
        position: relative;
        overflow: hidden;
    }

    /* Animated Title */
    .animated-title-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 5;
    }

    .matrix-rain {
        position: absolute;
        top: -50px;
        left: -150px;
        right: -150px;
        bottom: -50px;
        overflow: hidden;
        opacity: 0.1;
        z-index: 1;
    }

    .matrix-column {
        position: absolute;
        top: 0;
        width: 20px;
        height: 100%;
        animation: matrix-fall 4s linear infinite;
    }

    .matrix-column:nth-child(odd) {
        left: calc(var(--i, 0) * 6.67%);
    }

    .matrix-column:nth-child(even) {
        left: calc(var(--i, 0) * 6.67% + 3.33%);
    }

    .matrix-char {
        display: block;
        color: var(--primary-color);
        font-size: 14px;
        line-height: 1.4;
        animation: matrix-glow 3s ease-in-out infinite alternate;
    }

    @keyframes matrix-fall {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
    }

    @keyframes matrix-glow {
        0% { opacity: 0.2; }
        100% { opacity: 0.8; }
    }

    .animated-title {
        font-size: 3.5rem;
        font-weight: bold;
        margin: 0;
        position: relative;
        z-index: 2;
    }

    .title-word {
        display: inline-block;
        color: var(--primary-color);
        text-shadow: 
            0 0 5px var(--primary-color),
            0 0 10px var(--primary-color),
            0 0 15px var(--primary-color);
    }

    .glitch-word {
        animation: title-glitch 4s ease-in-out infinite;
        position: relative;
    }

    .title-separator {
        color: var(--secondary-color);
        animation: separator-pulse 2s ease-in-out infinite;
    }

    @keyframes title-glitch {
        0%, 90%, 100% { 
            transform: translate(0);
            filter: hue-rotate(0deg);
        }
        3% { 
            transform: translate(-2px, 2px);
            filter: hue-rotate(90deg);
        }
        6% { 
            transform: translate(2px, -2px);
            filter: hue-rotate(180deg);
        }
        9% { 
            transform: translate(-2px, -2px);
            filter: hue-rotate(270deg);
        }
        12% { 
            transform: translate(2px, 2px);
            filter: hue-rotate(360deg);
        }
        15% { 
            transform: translate(0);
            filter: hue-rotate(0deg);
        }
    }

    @keyframes separator-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }

    .subtitle {
        margin-top: 1.5rem;
        font-size: 1.1rem;
        color: var(--secondary-color);
    }

    .typing-text {
        animation: typing 5s steps(50) infinite;
        border-right: 2px solid var(--accent-color);
    }

    .cursor {
        animation: cursor-blink 1s infinite;
        color: var(--accent-color);
    }

    @keyframes typing {
        0%, 40% { width: 0; }
        80%, 100% { width: 100%; }
    }

    @keyframes cursor-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }

    .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        margin-top: 1rem;
        justify-content: center;
    }

    .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--accent-color);
        animation: status-pulse 2s ease-in-out infinite;
    }

    .status-text {
        color: var(--accent-color);
        font-size: 0.9rem;
        font-weight: bold;
    }

    @keyframes status-pulse {
        0%, 100% { 
            opacity: 1;
            box-shadow: 0 0 0 0 var(--accent-color);
        }
        50% { 
            opacity: 0.7;
            box-shadow: 0 0 0 8px transparent;
        }
    }

    .theme-switcher-container {
        z-index: 10;
    }

    /* Content */
    .home-content {
        flex: 1;
        padding: 3rem 2rem;
        background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
    }

    .menu-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    :global(.menu-card) {
        display: block;
        background: var(--card-background);
        border: 1px solid var(--border-color);
        padding: 2rem;
        border-radius: 4px;
        text-decoration: none;
        color: var(--text-color);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        cursor: pointer;
    }

    :global(.menu-card::before) {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s;
    }

    :global(.menu-card:hover::before) {
        left: 100%;
    }

    :global(.menu-card:hover) {
        border-color: var(--primary-color);
        box-shadow: 
            0 0 20px var(--primary-color),
            inset 0 0 20px rgba(255, 255, 255, 0.05);
        transform: translateY(-5px);
    }

    .menu-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        text-align: center;
        filter: drop-shadow(0 0 10px var(--primary-color));
    }

    .menu-title {
        color: var(--primary-color);
        font-size: 1.3rem;
        margin-bottom: 0.8rem;
        text-align: center;
        font-weight: bold;
        text-shadow: 0 0 5px var(--primary-color);
    }

    .menu-description {
        color: var(--secondary-color);
        font-size: 0.9rem;
        text-align: center;
        margin-bottom: 1.5rem;
        line-height: 1.4;
    }

    .menu-arrow {
        position: absolute;
        bottom: 1rem;
        right: 1.5rem;
        color: var(--accent-color);
        font-size: 1.5rem;
        font-weight: bold;
        transition: transform 0.3s ease;
    }

    :global(.menu-card:hover) .menu-arrow {
        transform: translateX(5px);
        color: var(--primary-color);
    }

    /* Footer */
    .home-footer {
        padding: 1.5rem 2rem;
        border-top: 1px solid var(--border-color);
        background: rgba(0, 0, 0, 0.3);
    }

    .footer-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1400px;
        margin: 0 auto;
        font-size: 0.8rem;
    }

    .footer-version {
        color: var(--secondary-color);
    }

    .footer-status {
        color: var(--accent-color);
        animation: status-blink 3s ease-in-out infinite;
    }

    @keyframes status-blink {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.5; }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .animated-title {
            font-size: 2.5rem;
        }
        
        .home-header {
            padding: 1.5rem;
            min-height: 150px;
        }
        
        .home-content {
            padding: 2rem 1rem;
        }
        
        .menu-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .footer-info {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
        }
    }

    @media (max-width: 480px) {
        .animated-title {
            font-size: 2rem;
        }
        
        .subtitle {
            font-size: 0.9rem;
        }
        
        :global(.menu-card) {
            padding: 1.5rem;
        }
        
        .menu-icon {
            font-size: 2.5rem;
        }
        
        .menu-title {
            font-size: 1.1rem;
        }
    }
</style>
