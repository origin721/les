<script lang="ts">
    import { BasePage, ContentSection, SecurityBadges } from "../../../components/page_templates";
    import { Link, ROUTES } from "../../../routing";

    const securityBadges = [
        { icon: "🔐", text: "ENCRYPTED" },
        { icon: "👥", text: "P2P-SECURE" },
        { icon: "⚡", text: "REAL-TIME" }
    ];

    const methods = [
        {
            href: ROUTES.ADD_FRIEND_BY_NAME,
            icon: "👤",
            title: "ДОБАВИТЬ_ПО_ИМЕНИ",
            subtitle: "SIMPLE_ADD",
            description: "Простое добавление контакта по имени с последующей настройкой безопасности",
            features: ["SIMPLE", "QUICK", "NAME-BASED"]
        },
        {
            href: ROUTES.ADD_FRIEND_ENCRYPTION,
            icon: "🔒",
            title: "ШИФРОВАНИЕ_РУКАМИ",
            subtitle: "MANUAL_ENCRYPTION",
            description: "Ручное шифрование данных для максимальной безопасности обмена информацией",
            features: ["AES-256", "RSA-4096", "MANUAL"]
        },
        {
            href: ROUTES.ADD_FRIEND_PEER_TO_PEER,
            icon: "🌐",
            title: "PEER_TO_PEER",
            subtitle: "DIRECT_CONNECTION",
            description: "Прямое соединение между устройствами без промежуточных серверов",
            features: ["LIBP2P", "NO-SERVER", "DIRECT"]
        },
        {
            href: ROUTES.ADD_FRIEND_SSE,
            icon: "⚡",
            title: "SERVER_SENT_EVENTS",
            subtitle: "REAL_TIME_SYNC",
            description: "Синхронизация в реальном времени через защищенное соединение",
            features: ["SSE", "REAL-TIME", "SYNC"]
        }
    ];
</script>

<BasePage 
    title="ADD_FRIEND"
    subtitle="СИСТЕМА_ДОБАВЛЕНИЯ_КОНТАКТОВ"
    pageName="AddFriendPage"
    footerVersion="// ADD_FRIEND_v0.1.0 //"
    footerStatus="PROTOCOLS: ACTIVE"
>
    {#snippet children()}
        <ContentSection 
            title="// ПРОТОКОЛЫ ПОДКЛЮЧЕНИЯ //"
            description="Выберите подходящий метод для безопасного добавления нового контакта"
        >
            {#snippet children()}
                <div class="methods-container">
                    <div class="methods-grid">
                        {#each methods as method}
                            <Link href={method.href} className="method-card">
                                <div class="method-header">
                                    <div class="method-icon">{method.icon}</div>
                                    <div class="method-titles">
                                        <h3 class="method-title">{method.title}</h3>
                                        <div class="method-subtitle">{method.subtitle}</div>
                                    </div>
                                </div>
                                
                                <div class="method-description">
                                    {method.description}
                                </div>
                                
                                <div class="method-features">
                                    {#each method.features as feature}
                                        <span class="feature-badge">{feature}</span>
                                    {/each}
                                </div>
                                
                                <div class="method-arrow">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </Link>
                        {/each}
                    </div>

                    <div class="security-info">
                        <SecurityBadges badges={securityBadges} />
                        
                        <div class="protocol-notice">
                            <div class="notice-header">
                                <span class="notice-icon">🛡️</span>
                                <span class="notice-title">БЕЗОПАСНОСТЬ ПРЕВЫШЕ ВСЕГО</span>
                            </div>
                            <p class="notice-text">
                                Все протоколы используют современные криптографические алгоритмы 
                                для обеспечения максимальной защиты ваших данных.
                            </p>
                        </div>
                    </div>
                </div>
            {/snippet}
        </ContentSection>
    {/snippet}
</BasePage>

<style>
    .methods-container {
        display: flex;
        flex-direction: column;
        gap: 3rem;
    }

    .methods-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
    }

    :global(.method-card) {
        display: block;
        background: var(--card-background);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 2rem;
        text-decoration: none;
        color: var(--text-color);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        cursor: pointer;
    }

    :global(.method-card::before) {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s;
    }

    :global(.method-card:hover::before) {
        left: 100%;
    }

    :global(.method-card:hover) {
        border-color: var(--primary-color);
        box-shadow: 
            0 0 25px var(--primary-color),
            inset 0 0 25px rgba(255, 255, 255, 0.05);
        transform: translateY(-8px);
    }

    .method-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .method-icon {
        font-size: 3rem;
        filter: drop-shadow(0 0 10px var(--primary-color));
        animation: icon-pulse 3s ease-in-out infinite;
    }

    @keyframes icon-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    .method-titles {
        flex: 1;
    }

    .method-title {
        color: var(--primary-color);
        font-size: 1.4rem;
        font-weight: bold;
        margin: 0 0 0.5rem 0;
        text-shadow: 0 0 8px var(--primary-color);
    }

    .method-subtitle {
        color: var(--secondary-color);
        font-size: 0.9rem;
        font-family: 'Courier New', monospace;
        opacity: 0.8;
    }

    .method-description {
        color: var(--text-color);
        line-height: 1.6;
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
    }

    .method-features {
        display: flex;
        gap: 0.8rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }

    .feature-badge {
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid var(--border-color);
        color: var(--accent-color);
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
        animation: badge-glow 2s ease-in-out infinite alternate;
    }

    @keyframes badge-glow {
        0% { box-shadow: 0 0 5px transparent; }
        100% { box-shadow: 0 0 10px var(--accent-color); }
    }

    .method-arrow {
        position: absolute;
        bottom: 1.5rem;
        right: 1.5rem;
        color: var(--secondary-color);
        transition: all 0.3s ease;
    }

    :global(.method-card:hover) .method-arrow {
        color: var(--primary-color);
        transform: translateX(8px);
    }

    .security-info {
        text-align: center;
    }

    .protocol-notice {
        margin-top: 2rem;
        padding: 1.5rem;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border-color);
        border-radius: 8px;
    }

    .notice-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.8rem;
        margin-bottom: 1rem;
    }

    .notice-icon {
        font-size: 1.5rem;
        filter: drop-shadow(0 0 8px var(--accent-color));
    }

    .notice-title {
        color: var(--accent-color);
        font-weight: bold;
        font-size: 1.1rem;
        text-shadow: 0 0 5px var(--accent-color);
    }

    .notice-text {
        color: var(--text-color);
        line-height: 1.6;
        margin: 0;
        opacity: 0.9;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .methods-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .method-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }
        
        .method-features {
            justify-content: center;
        }
        
        :global(.method-card) {
            padding: 1.5rem;
        }
    }

    @media (max-width: 480px) {
        .method-icon {
            font-size: 2.5rem;
        }
        
        .method-title {
            font-size: 1.2rem;
        }
        
        .methods-container {
            gap: 2rem;
        }
    }
</style>
