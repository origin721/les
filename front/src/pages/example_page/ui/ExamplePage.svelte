<script lang="ts">
  import { BasePage, ContentSection, SecurityBadges } from "../../../components/page_templates";

  const badges = [
    { icon: "🚀", text: "FAST" },
    { icon: "🔒", text: "SECURE" },
    { icon: "⚡", text: "EFFICIENT" }
  ];

  let counter = $state(0);
</script>

<BasePage 
  title="EXAMPLE_PAGE"
  subtitle="ПРИМЕР_ИСПОЛЬЗОВАНИЯ_ШАБЛОНОВ"
  pageName="ExamplePage"
  footerVersion="// EXAMPLE_v1.0.0 //"
  footerStatus="DEMO: ACTIVE"
>
  {#snippet children()}
    <ContentSection 
      title="// ДЕМОНСТРАЦИЯ ВОЗМОЖНОСТЕЙ //"
      description="Пример использования переиспользуемых компонентов"
    >
      {#snippet children()}
        <div class="demo-content">
          <div class="counter-section">
            <h3>Интерактивный счетчик</h3>
            <div class="counter-display">{counter}</div>
            <div class="counter-buttons">
              <button onclick={() => counter--} class="counter-btn">-</button>
              <button onclick={() => counter = 0} class="counter-btn reset">СБРОС</button>
              <button onclick={() => counter++} class="counter-btn">+</button>
            </div>
          </div>

          <div class="info-section">
            <h3>Преимущества шаблонов</h3>
            <ul class="benefits-list">
              <li>✅ Быстрое создание новых страниц</li>
              <li>✅ Консистентный дизайн</li>
              <li>✅ Автоматическая поддержка тем</li>
              <li>✅ Встроенные анимации</li>
              <li>✅ Адаптивность из коробки</li>
            </ul>
          </div>

          <SecurityBadges badges={badges} />

          <div class="code-example">
            <h3>Код этой страницы:</h3>
            <pre class="code-block">
{`<BasePage 
  title="EXAMPLE_PAGE"
  subtitle="ПРИМЕР_ИСПОЛЬЗОВАНИЯ_ШАБЛОНОВ"
>
  {#snippet children()}
    <ContentSection title="// ЗАГОЛОВОК //">
      {#snippet children()}
        <p>Ваш контент здесь...</p>
      {/snippet}
    </ContentSection>
  {/snippet}
</BasePage>`}
            </pre>
          </div>
        </div>
      {/snippet}
    </ContentSection>
  {/snippet}
</BasePage>

<style>
  .demo-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .counter-section {
    text-align: center;
    padding: 2rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
  }

  .counter-section h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
  }

  .counter-display {
    font-size: 3rem;
    color: var(--accent-color);
    font-weight: bold;
    margin: 1rem 0;
    text-shadow: 0 0 10px var(--accent-color);
  }

  .counter-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .counter-btn {
    padding: 0.8rem 1.5rem;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    font-family: inherit;
    font-size: 1.2rem;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .counter-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    box-shadow: 0 0 10px var(--primary-color);
  }

  .counter-btn.reset {
    background: var(--primary-color);
    color: var(--background-color);
  }

  .counter-btn.reset:hover {
    background: var(--secondary-color);
  }

  .info-section h3 {
    color: var(--secondary-color);
    margin-bottom: 1rem;
  }

  .benefits-list {
    list-style: none;
    padding: 0;
    color: var(--text-color);
  }

  .benefits-list li {
    padding: 0.5rem 0;
    transition: color 0.2s;
  }

  .benefits-list li:hover {
    color: var(--primary-color);
  }

  .code-example h3 {
    color: var(--accent-color);
    margin-bottom: 1rem;
  }

  .code-block {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 1.5rem;
    color: var(--text-color);
    font-size: 0.9rem;
    overflow-x: auto;
    white-space: pre-wrap;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .counter-buttons {
      flex-direction: column;
      align-items: center;
    }
    
    .counter-btn {
      width: 200px;
    }
    
    .demo-content {
      gap: 1.5rem;
    }
  }
</style>
