<script lang="ts">
    import { Link, ROUTES } from "../../../routing";
    import styles from "./DocsPage.module.css";

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

<div class={styles["docs-container"]} data-widget-name="DocsPage">
    <header class={styles["docs-header"]}>
        <div class="back-link-container z-10">
            <Link href={ROUTES.HOME} className={styles["back-link"]}>
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
        
        <div class={styles["animated-title-container"]}>
            <div class={styles["matrix-rain"]}>
                {#each Array(20) as _, i}
                    <div class={styles["matrix-column"]} style="animation-delay: {i * 0.1}s;">
                        {#each Array(10) as _, j}
                            <span class={styles["matrix-char"]} style="animation-delay: {(i * 0.1) + (j * 0.05)}s;">
                                {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                            </span>
                        {/each}
                    </div>
                {/each}
            </div>
            
            <h1 class={styles["animated-title"]}>
                <span class="{styles['title-word']} {styles['glitch-word']}" style="animation-delay: 0s;">КАК</span>
                <span class={styles["title-separator"]}>_</span>
                <span class="{styles['title-word']} {styles['glitch-word']}" style="animation-delay: 0.3s;">ЭТО</span>
                <span class={styles["title-separator"]}>_</span>
                <span class="{styles['title-word']} {styles['glitch-word']}" style="animation-delay: 0.6s;">РАБОТАЕТ</span>
                <span class={styles["title-question"]}>?</span>
            </h1>
            
            <div class={styles["subtitle"]}>
                <span class={styles["typing-text"]}>СИСТЕМА_АУТЕНТИФИКАЦИИ_И_ШИФРОВАНИЯ</span>
                <span class={styles["cursor"]}>█</span>
            </div>
            
            <div class={styles["question-animation"]}>
                <div class={styles["question-mark"]}>?</div>
                <div class={styles["question-mark"]}>?</div>
                <div class={styles["question-mark"]}>?</div>
            </div>
        </div>
    </header>

    <nav class={styles["docs-nav"]}>
        {#each sections as section}
            <button 
                class="{styles['nav-item']} {currentSection === section.id ? styles.active : ''}"
                onclick={() => setSection(section.id)}
            >
                <span class={styles["nav-icon"]}>{section.icon}</span>
                <span class={styles["nav-text"]}>{section.title}</span>
            </button>
        {/each}
    </nav>

    <main class={styles["docs-content"]}>
        {#if currentSection === "overview"}
            <section class={styles["content-section"]}>
                <h2 class={styles["section-title"]}>// ОБЗОР СИСТЕМЫ //</h2>
                <div class={styles["info-grid"]}>
                    <div class={styles["info-card"]}>
                        <h3>СТАТУС РАЗРАБОТКИ</h3>
                        <div class={styles["status-indicator"]}>
                            <span class="{styles['status-dot']} {styles.active}"></span>
                            <span>АКТИВНАЯ РАЗРАБОТКА</span>
                        </div>
                        <p>Система находится в стадии активной разработки. Базовые компоненты реализованы и функциональны.</p>
                    </div>
                    
                    <div class={styles["info-card"]}>
                        <h3>АРХИТЕКТУРА</h3>
                        <ul class={styles["feature-list"]}>
                            <li>✓ Клиентское шифрование</li>
                            <li>✓ Управление пользователями</li>
                            <li>⚠ P2P коммуникация (в разработке)</li>
                            <li>⚠ Групповые чаты (планируется)</li>
                        </ul>
                    </div>
                </div>
            </section>

        {:else if currentSection === "encryption"}
            <section class={styles["content-section"]}>
                <h2 class={styles["section-title"]}>// АЛГОРИТМЫ ШИФРОВАНИЯ //</h2>
                <div class={styles["crypto-info"]}>
                    <div class={styles["crypto-card"]}>
                        <h3>LIBSODIUM</h3>
                        <p>Основная криптографическая библиотека для клиентского шифрования.</p>
                        <div class={styles["tech-details"]}>
                            <span class={styles["tech-tag"]}>Curve25519</span>
                            <span class={styles["tech-tag"]}>Ed25519</span>
                        </div>
                    </div>
                    
                    <div class={styles["crypto-card"]}>
                        <h3>ИСПОЛЬЗОВАНИЕ</h3>
                        <p>Когда вы хотите отправить себе пароль, но зашифровать его на клиенте перед отправкой.</p>
                        <div class={styles["use-case"]}>
                            <code>CLIENT → ENCRYPT → SEND → STORE → DECRYPT → CLIENT</code>
                        </div>
                    </div>
                </div>
            </section>

        {:else if currentSection === "users"}
            <section class={styles["content-section"]}>
                <h2 class={styles["section-title"]}>// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ //</h2>
                <div class={styles["user-info"]}>
                    <div class={styles["feature-status"]}>
                        <h3>РЕАЛИЗОВАННЫЕ ФУНКЦИИ</h3>
                        <ul class={styles["status-list"]}>
                            <li class={styles.implemented}>✓ Создание пользователя</li>
                            <li class={styles.implemented}>✓ Аутентификация</li>
                            <li class={styles.implemented}>✓ Локальное хранение ключей</li>
                            <li class={styles["in-progress"]}>⚠ Обмен ключами</li>
                            <li class={styles.planned}>○ Групповые права</li>
                        </ul>
                    </div>
                    
                    <div class={styles["security-note"]}>
                        <h3>БЕЗОПАСНОСТЬ</h3>
                        <p>Все приватные ключи хранятся локально и никогда не передаются на сервер в незашифрованном виде.</p>
                    </div>
                </div>
            </section>

        {:else if currentSection === "roadmap"}
            <section class={styles["content-section"]}>
                <h2 class={styles["section-title"]}>// ПЛАН РАЗВИТИЯ //</h2>
                <div class={styles.roadmap}>
                    <div class="{styles['roadmap-item']} {styles.completed}">
                        <div class={styles["roadmap-marker"]}></div>
                        <div class={styles["roadmap-content"]}>
                            <h3>ФАЗА 1: ОСНОВЫ</h3>
                            <p>Базовое шифрование и управление пользователями</p>
                            <span class={styles["roadmap-status"]}>ЗАВЕРШЕНО</span>
                        </div>
                    </div>
                    
                    <div class="{styles['roadmap-item']} {styles.current}">
                        <div class={styles["roadmap-marker"]}></div>
                        <div class={styles["roadmap-content"]}>
                            <h3>ФАЗА 2: КОММУНИКАЦИЯ</h3>
                            <p>P2P соединения и обмен сообщениями</p>
                            <span class={styles["roadmap-status"]}>В ПРОЦЕССЕ</span>
                        </div>
                    </div>
                    
                    <div class="{styles['roadmap-item']} {styles.planned}">
                        <div class={styles["roadmap-marker"]}></div>
                        <div class={styles["roadmap-content"]}>
                            <h3>ФАЗА 3: РАСШИРЕНИЕ</h3>
                            <p>Групповые чаты и дополнительные функции</p>
                            <span class={styles["roadmap-status"]}>ПЛАНИРУЕТСЯ</span>
                        </div>
                    </div>
                </div>
            </section>

        {:else if currentSection === "security"}
            <section class={styles["content-section"]}>
                <h2 class={styles["section-title"]}>// МОДЕЛЬ БЕЗОПАСНОСТИ //</h2>
                <div class={styles["security-model"]}>
                    <div class={styles["security-principle"]}>
                        <h3>ZERO-KNOWLEDGE</h3>
                        <p>Сервер не имеет доступа к вашим приватным ключам или незашифрованным данным.</p>
                    </div>
                    
                    <div class={styles["security-principle"]}>
                        <h3>END-TO-END</h3>
                        <p>Шифрование происходит на устройстве отправителя и расшифровка на устройстве получателя.</p>
                    </div>
                    
                    <div class={styles["security-principle"]}>
                        <h3>FORWARD SECRECY</h3>
                        <p>Компрометация долгосрочных ключей не влияет на безопасность прошлых сессий.</p>
                    </div>
                </div>
            </section>
        {/if}
    </main>

    <footer class={styles["docs-footer"]}>
        <p>// SECURE_DOCUMENTATION_TERMINAL_v0.0.1 //</p>
    </footer>
</div>
