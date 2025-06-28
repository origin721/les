<script lang="ts">
    import { Link, ROUTES } from "../../../routing";
    import { theme } from "../../../stores/theme";
    import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";

    // Import theme styles
    import "../../../styles/cyberpunk.css";
    import "../../../styles/watchdogs.css";
    import "../../../styles/pixel.css";

    let currentSection = $state("overview");

    const sections = [
        { id: "overview", title: "ОБЗОР", icon: "📋" },
        { id: "encryption", title: "ШИФРОВАНИЕ", icon: "🔐" },
        { id: "users", title: "ПОЛЬЗОВАТЕЛИ", icon: "👤" },
        { id: "roadmap", title: "ПЛАН", icon: "🗺️" },
        { id: "security", title: "БЕЗОПАСНОСТЬ", icon: "🛡️" }
    ];

    function setSection(sectionId: string) {
        currentSection = sectionId;
    }
</script>

<div class="theme-{$theme}">
    <div class="docs-container" data-widget-name="AuthDocsPage">
        <header class="docs-header">
            <div class="back-link-container">
                <Link href={ROUTES.AUTH} className="back-link">
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
                    >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span>AUTH.SYS</span>
                </Link>
            </div>
            
            <div class="animated-title-container">
                <div class="matrix-rain">
                    {#each Array(20) as _, i}
                        <div class="matrix-column" style="animation-delay: {i * 0.1}s;">
                            {#each Array(10) as _, j}
                                <span class="matrix-char" style="animation-delay: {(i * 0.1) + (j * 0.05)}s;">
                                    {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                                </span>
                            {/each}
                        </div>
                    {/each}
                </div>
                
                <h1 class="animated-title">
                    <span class="title-word glitch-word" style="animation-delay: 0s;">КАК</span>
                    <span class="title-separator">_</span>
                    <span class="title-word glitch-word" style="animation-delay: 0.3s;">ЭТО</span>
                    <span class="title-separator">_</span>
                    <span class="title-word glitch-word" style="animation-delay: 0.6s;">РАБОТАЕТ</span>
                    <span class="title-question">?</span>
                </h1>
                
                <div class="subtitle">
                    <span class="typing-text">СИСТЕМА_АУТЕНТИФИКАЦИИ_И_ШИФРОВАНИЯ</span>
                    <span class="cursor">█</span>
                </div>
                
                <div class="question-animation">
                    <div class="question-mark">?</div>
                    <div class="question-mark">?</div>
                    <div class="question-mark">?</div>
                </div>
            </div>

            <div class="theme-switcher-container">
                <ThemeSwitcher />
            </div>
        </header>

        <nav class="docs-nav">
            {#each sections as section}
                <button 
                    class="nav-item {currentSection === section.id ? 'active' : ''}"
                    onclick={() => setSection(section.id)}
                >
                    <span class="nav-icon">{section.icon}</span>
                    <span class="nav-text">{section.title}</span>
                </button>
            {/each}
        </nav>

        <main class="docs-content">
            {#if currentSection === "overview"}
                <section class="content-section">
                    <h2 class="section-title">// ОБЗОР СИСТЕМЫ //</h2>
                    <div class="info-grid">
                        <div class="info-card">
                            <h3>СТАТУС РАЗРАБОТКИ</h3>
                            <div class="status-indicator">
                                <span class="status-dot active"></span>
                                <span>АКТИВНАЯ РАЗРАБОТКА</span>
                            </div>
                            <p>Система находится в стадии активной разработки. Базовые компоненты реализованы и функциональны.</p>
                        </div>
                        
                        <div class="info-card">
                            <h3>АРХИТЕКТУРА</h3>
                            <ul class="feature-list">
                                <li>✓ Клиентское шифрование</li>
                                <li>✓ Управление пользователями</li>
                                <li>⚠ P2P коммуникация (в разработке)</li>
                                <li>⚠ Групповые чаты (планируется)</li>
                            </ul>
                        </div>
                    </div>
                </section>

            {:else if currentSection === "encryption"}
                <section class="content-section">
                    <h2 class="section-title">// АЛГОРИТМЫ ШИФРОВАНИЯ //</h2>
                    <div class="crypto-info">
                        <div class="crypto-card">
                            <h3>LIBSODIUM</h3>
                            <p>Основная криптографическая библиотека для клиентского шифрования.</p>
                            <div class="tech-details">
                                <span class="tech-tag">Curve25519</span>
                                <span class="tech-tag">Ed25519</span>
                            </div>
                        </div>
                        
                        <div class="crypto-card">
                            <h3>ИСПОЛЬЗОВАНИЕ</h3>
                            <p>Когда вы хотите отправить себе пароль, но зашифровать его на клиенте перед отправкой.</p>
                            <div class="use-case">
                                <code>CLIENT → ENCRYPT → SEND → STORE → DECRYPT → CLIENT</code>
                            </div>
                        </div>
                    </div>
                </section>

            {:else if currentSection === "users"}
                <section class="content-section">
                    <h2 class="section-title">// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ //</h2>
                    <div class="user-info">
                        <div class="feature-status">
                            <h3>РЕАЛИЗОВАННЫЕ ФУНКЦИИ</h3>
                            <ul class="status-list">
                                <li class="implemented">✓ Создание пользователя</li>
                                <li class="implemented">✓ Аутентификация</li>
                                <li class="implemented">✓ Локальное хранение ключей</li>
                                <li class="in-progress">⚠ Обмен ключами</li>
                                <li class="planned">○ Групповые права</li>
                            </ul>
                        </div>
                        
                        <div class="security-note">
                            <h3>БЕЗОПАСНОСТЬ</h3>
                            <p>Все приватные ключи хранятся локально и никогда не передаются на сервер в незашифрованном виде.</p>
                        </div>
                    </div>
                </section>

            {:else if currentSection === "roadmap"}
                <section class="content-section">
                    <h2 class="section-title">// ПЛАН РАЗВИТИЯ //</h2>
                    <div class="roadmap">
                        <div class="roadmap-item completed">
                            <div class="roadmap-marker"></div>
                            <div class="roadmap-content">
                                <h3>ФАЗА 1: ОСНОВЫ</h3>
                                <p>Базовое шифрование и управление пользователями</p>
                                <span class="roadmap-status">ЗАВЕРШЕНО</span>
                            </div>
                        </div>
                        
                        <div class="roadmap-item current">
                            <div class="roadmap-marker"></div>
                            <div class="roadmap-content">
                                <h3>ФАЗА 2: КОММУНИКАЦИЯ</h3>
                                <p>P2P соединения и обмен сообщениями</p>
                                <span class="roadmap-status">В ПРОЦЕССЕ</span>
                            </div>
                        </div>
                        
                        <div class="roadmap-item planned">
                            <div class="roadmap-marker"></div>
                            <div class="roadmap-content">
                                <h3>ФАЗА 3: РАСШИРЕНИЕ</h3>
                                <p>Групповые чаты и дополнительные функции</p>
                                <span class="roadmap-status">ПЛАНИРУЕТСЯ</span>
                            </div>
                        </div>
                    </div>
                </section>

            {:else if currentSection === "security"}
                <section class="content-section">
                    <h2 class="section-title">// МОДЕЛЬ БЕЗОПАСНОСТИ //</h2>
                    <div class="security-model">
                        <div class="security-principle">
                            <h3>ZERO-KNOWLEDGE</h3>
                            <p>Сервер не имеет доступа к вашим приватным ключам или незашифрованным данным.</p>
                        </div>
                        
                        <div class="security-principle">
                            <h3>END-TO-END</h3>
                            <p>Шифрование происходит на устройстве отправителя и расшифровка на устройстве получателя.</p>
                        </div>
                        
                        <div class="security-principle">
                            <h3>FORWARD SECRECY</h3>
                            <p>Компрометация долгосрочных ключей не влияет на безопасность прошлых сессий.</p>
                        </div>
                    </div>
                </section>
            {/if}
        </main>

        <footer class="docs-footer">
            <p>// SECURE_DOCUMENTATION_TERMINAL_v0.0.1 //</p>
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

    .docs-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: "Courier New", Courier, monospace;
        overflow: hidden;
        border: 2px solid var(--border-color);
        box-shadow: 0 0 25px var(--primary-color) inset;
    }

    /* Header */
    .docs-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        min-height: 120px;
        position: relative;
        overflow: hidden;
    }

    .back-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--secondary-color);
        text-decoration: none;
        transition: all 0.2s;
        z-index: 10;
    }
    
    .back-link:hover {
        color: var(--primary-color);
        text-shadow: 0 0 5px var(--primary-color);
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
        left: -100px;
        right: -100px;
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
        animation: matrix-fall 3s linear infinite;
    }

    .matrix-column:nth-child(odd) {
        left: calc(var(--i, 0) * 5%);
    }

    .matrix-column:nth-child(even) {
        left: calc(var(--i, 0) * 5% + 2.5%);
    }

    .matrix-char {
        display: block;
        color: var(--primary-color);
        font-size: 12px;
        line-height: 1.2;
        animation: matrix-glow 2s ease-in-out infinite alternate;
    }

    @keyframes matrix-fall {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
    }

    @keyframes matrix-glow {
        0% { opacity: 0.3; }
        100% { opacity: 1; }
    }

    .animated-title {
        font-size: 3rem;
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
        animation: question-glitch 3s ease-in-out infinite;
        position: relative;
    }

    .glitch-word::before,
    .glitch-word::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .glitch-word::before {
        animation: glitch-1 0.5s infinite;
        color: var(--secondary-color);
        z-index: -1;
    }

    .glitch-word::after {
        animation: glitch-2 0.5s infinite;
        color: var(--accent-color);
        z-index: -2;
    }

    .title-separator {
        color: var(--secondary-color);
        animation: separator-pulse 1.5s ease-in-out infinite;
    }

    .title-question {
        color: var(--accent-color);
        animation: question-bounce 2s ease-in-out infinite;
        display: inline-block;
        font-size: 1.2em;
        margin-left: 0.2em;
    }

    .question-animation {
        position: absolute;
        top: -20px;
        right: -50px;
        display: flex;
        gap: 10px;
    }

    .question-mark {
        color: var(--accent-color);
        font-size: 1.5rem;
        animation: float-question 3s ease-in-out infinite;
        opacity: 0.7;
    }

    .question-mark:nth-child(1) {
        animation-delay: 0s;
    }

    .question-mark:nth-child(2) {
        animation-delay: 0.5s;
    }

    .question-mark:nth-child(3) {
        animation-delay: 1s;
    }

    @keyframes question-glitch {
        0%, 90%, 100% { 
            transform: translate(0);
            filter: hue-rotate(0deg);
        }
        5% { 
            transform: translate(-2px, 2px);
            filter: hue-rotate(90deg);
        }
        10% { 
            transform: translate(2px, -2px);
            filter: hue-rotate(180deg);
        }
        15% { 
            transform: translate(-2px, -2px);
            filter: hue-rotate(270deg);
        }
        20% { 
            transform: translate(2px, 2px);
            filter: hue-rotate(360deg);
        }
        25% { 
            transform: translate(0);
            filter: hue-rotate(0deg);
        }
    }

    @keyframes glitch-1 {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
    }

    @keyframes glitch-2 {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(2px, 2px); }
        40% { transform: translate(2px, -2px); }
        60% { transform: translate(-2px, 2px); }
        80% { transform: translate(-2px, -2px); }
    }

    @keyframes question-bounce {
        0%, 100% { 
            transform: translateY(0) scale(1);
            text-shadow: 0 0 10px var(--accent-color);
        }
        25% { 
            transform: translateY(-10px) scale(1.1);
            text-shadow: 0 0 20px var(--accent-color);
        }
        50% { 
            transform: translateY(0) scale(1.2);
            text-shadow: 0 0 30px var(--accent-color);
        }
        75% { 
            transform: translateY(-5px) scale(1.1);
            text-shadow: 0 0 20px var(--accent-color);
        }
    }

    @keyframes float-question {
        0%, 100% { 
            transform: translateY(0) rotate(0deg);
            opacity: 0.7;
        }
        25% { 
            transform: translateY(-15px) rotate(5deg);
            opacity: 1;
        }
        50% { 
            transform: translateY(-30px) rotate(0deg);
            opacity: 0.5;
        }
        75% { 
            transform: translateY(-15px) rotate(-5deg);
            opacity: 1;
        }
    }

    @keyframes separator-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }

    .subtitle {
        margin-top: 1rem;
        font-size: 1rem;
        color: var(--secondary-color);
    }

    .typing-text {
        animation: typing 4s steps(40) infinite;
        border-right: 2px solid var(--accent-color);
    }

    .cursor {
        animation: cursor-blink 1s infinite;
        color: var(--accent-color);
    }

    @keyframes typing {
        0%, 50% { width: 0; }
        100% { width: 100%; }
    }

    @keyframes cursor-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }

    .theme-switcher-container {
        z-index: 10;
    }

    /* Navigation */
    .docs-nav {
        display: flex;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid var(--border-color);
        background: rgba(0, 0, 0, 0.3);
        gap: 0.5rem;
        overflow-x: auto;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        font-family: inherit;
    }

    .nav-item:hover {
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 10px var(--primary-color);
    }

    .nav-item.active {
        background: var(--nav-active);
        color: var(--background-color);
        box-shadow: 0 0 15px var(--nav-active);
    }

    .nav-icon {
        font-size: 1.2rem;
    }

    /* Content */
    .docs-content {
        flex: 1;
        padding: 2rem;
        overflow-y: auto;
        background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
    }

    .content-section {
        max-width: 1200px;
        margin: 0 auto;
    }

    .section-title {
        font-size: 2rem;
        color: var(--primary-color);
        margin-bottom: 2rem;
        text-align: center;
        text-shadow: 0 0 10px var(--primary-color);
    }

    /* Info Grid */
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .info-card {
        background: var(--card-background);
        border: 1px solid var(--border-color);
        padding: 1.5rem;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }

    .info-card h3 {
        color: var(--secondary-color);
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }

    .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--accent-color);
        animation: status-pulse 2s ease-in-out infinite;
    }

    @keyframes status-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    .feature-list {
        list-style: none;
        padding: 0;
    }

    .feature-list li {
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Crypto Info */
    .crypto-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
    }

    .crypto-card {
        background: var(--card-background);
        border: 1px solid var(--border-color);
        padding: 2rem;
        border-radius: 4px;
    }

    .crypto-card h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
    }

    .tech-details {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 1rem;
    }

    .tech-tag {
        background: var(--primary-color);
        color: var(--background-color);
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        border-radius: 2px;
    }

    .use-case {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.5);
        border-left: 3px solid var(--accent-color);
    }

    .use-case code {
        color: var(--accent-color);
        font-family: inherit;
    }

    /* User Info */
    .user-info {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
    }

    .feature-status, .security-note {
        background: var(--card-background);
        border: 1px solid var(--border-color);
        padding: 2rem;
        border-radius: 4px;
    }

    .status-list {
        list-style: none;
        padding: 0;
    }

    .status-list li {
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .status-list li.implemented {
        color: var(--accent-color);
    }

    .status-list li.in-progress {
        color: var(--secondary-color);
    }

    .status-list li.planned {
        color: var(--text-color);
        opacity: 0.6;
    }

    /* Roadmap */
    .roadmap {
        position: relative;
        padding-left: 2rem;
    }

    .roadmap::before {
        content: '';
        position: absolute;
        left: 1rem;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--border-color);
    }

    .roadmap-item {
        position: relative;
        margin-bottom: 3rem;
        padding-left: 2rem;
    }

    .roadmap-marker {
        position: absolute;
        left: -0.5rem;
        top: 0.5rem;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        border: 2px solid var(--border-color);
        background: var(--background-color);
    }

    .roadmap-item.completed .roadmap-marker {
        background: var(--accent-color);
        border-color: var(--accent-color);
    }

    .roadmap-item.current .roadmap-marker {
        background: var(--primary-color);
        border-color: var(--primary-color);
        animation: roadmap-pulse 2s ease-in-out infinite;
    }

    @keyframes roadmap-pulse {
        0%, 100% { box-shadow: 0 0 0 0 var(--primary-color); }
        50% { box-shadow: 0 0 0 10px transparent; }
    }

    .roadmap-content h3 {
        color: var(--secondary-color);
        margin-bottom: 0.5rem;
    }

    .roadmap-status {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: var(--primary-color);
        color: var(--background-color);
        font-size: 0.8rem;
        border-radius: 2px;
        margin-top: 0.5rem;
    }

    /* Security Model */
    .security-model {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
    }

    .security-principle {
        background: var(--card-background);
        border: 1px solid var(--border-color);
        padding: 2rem;
        border-radius: 4px;
        text-align: center;
    }

    .security-principle h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }

    /* Footer */
    .docs-footer {
        padding: 1rem;
        border-top: 1px solid var(--border-color);
        text-align: center;
        font-size: 0.8rem;
        background: rgba(0, 0, 0, 0.3);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .animated-title {
            font-size: 2rem;
        }
        
        .docs-nav {
            flex-wrap: wrap;
        }
        
        .info-grid,
        .crypto-info,
        .user-info,
        .security-model {
            grid-template-columns: 1fr;
        }
        
        .roadmap {
            padding-left: 1rem;
        }
        
        .docs-content {
            padding: 1rem;
        }
    }
</style>
