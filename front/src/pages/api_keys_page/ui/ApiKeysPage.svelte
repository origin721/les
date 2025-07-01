<script lang="ts">
  import { BasePage, ContentSection, SecurityBadges } from "../../../components/page_templates";

  const securityBadges = [
    { icon: "🔑", text: "RSA-4096" },
    { icon: "🛡️", text: "AES-256" },
    { icon: "⚡", text: "SECURE-KEYS" }
  ];
</script>

<BasePage 
  title="API_KEYS"
  subtitle="СИСТЕМА_УПРАВЛЕНИЯ_КЛЮЧАМИ_ДОСТУПА"
  pageName="ApiKeysPage"
  footerVersion="// API_KEYS_v0.1.0 //"
  footerStatus="ENTROPY: HIGH"
>
  {#snippet children()}
    <ContentSection 
      title="// УПРАВЛЕНИЕ API КЛЮЧАМИ //"
      description="Безопасная генерация и управление ключами доступа"
    >
      {#snippet children()}
        <div class="development-notice">
          <div class="notice-header">
            <div class="notice-icon">🚧</div>
            <h3 class="notice-title">МОДУЛЬ В РАЗРАБОТКЕ</h3>
          </div>
          
          <div class="notice-content">
            <p class="notice-description">
              Система API ключей находится в стадии активной разработки.
              Функциональность будет добавлена в ближайших обновлениях.
            </p>
            
            <div class="planned-features">
              <h4>Запланированные функции:</h4>
              <ul class="feature-list">
                <li>• Генерация криптографически стойких ключей</li>
                <li>• Управление партнерскими ключами</li>
                <li>• Экспорт/импорт конфигураций</li>
                <li>• Система ролей и разрешений</li>
                <li>• Мониторинг активности ключей</li>
              </ul>
            </div>

            <SecurityBadges badges={securityBadges} />

            <div class="progress-bar">
              <div class="progress-fill" style="width: 25%"></div>
              <span class="progress-text">ПРОГРЕСС: 25%</span>
            </div>
          </div>
        </div>
      {/snippet}
    </ContentSection>
  {/snippet}
</BasePage>

<style>
  .development-notice {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }

  .notice-header {
    margin-bottom: 2rem;
  }

  .notice-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 10px var(--accent-color));
  }

  .notice-title {
    color: var(--primary-color);
    font-size: 2rem;
    margin: 0;
    text-shadow: 0 0 10px var(--primary-color);
  }

  .notice-content {
    text-align: left;
  }

  .notice-description {
    color: var(--text-color);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    text-align: center;
  }

  .planned-features {
    margin-bottom: 2rem;
  }

  .planned-features h4 {
    color: var(--secondary-color);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    color: var(--text-color);
  }

  .feature-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: color 0.2s;
  }

  .feature-list li:hover {
    color: var(--primary-color);
  }

  .feature-list li:last-child {
    border-bottom: none;
  }

  .progress-bar {
    position: relative;
    width: 100%;
    height: 30px;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 2rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transition: width 0.3s ease;
    animation: progress-glow 2s ease-in-out infinite alternate;
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--text-color);
    font-weight: bold;
    font-size: 0.9rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  @keyframes progress-glow {
    0% { box-shadow: inset 0 0 10px var(--primary-color); }
    100% { box-shadow: inset 0 0 20px var(--secondary-color); }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .notice-title {
      font-size: 1.5rem;
    }
    
    .notice-description {
      font-size: 1rem;
    }
    
    .development-notice {
      max-width: 100%;
    }
  }
</style>
