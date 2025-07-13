<script lang="ts">
    import { Button } from "../../../components";
  import { lang_store } from "../../../stores/lang_store.svelte";
  import formStyles from "../../../styles/modules/forms.module.css";

  // Массив поддерживаемых языков
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'it', name: 'Italiano' },
    { code: 'pl', name: 'Polski' },
    { code: 'uk', name: 'Українська' },
    { code: 'kk', name: 'Қазақша' }
  ];

  // Переводы для кнопки "Сохранить язык"
  const saveText = {
    en: "Save language",
    ru: "Сохранить язык",
    de: "Sprache speichern",
    fr: "Enregistrer la langue",
    es: "Guardar idioma",
    zh: "保存语言",
    ja: "言語を保存",
    it: "Salva lingua",
    pl: "Zapisz język",
    uk: "Зберегти мову",
    kk: "Тілді сақтау"
  };

  let selected = $state('en');

  function applyLang() {
    lang_store.state = selected;
  }

  function handleSelect(event) {
    selected = event.target.value;
  }
</script>

<div class={formStyles.group} style="max-width: 340px; margin: 2rem auto;">
  <label for="lang-select" class={`${formStyles.label} ${formStyles.labelRequired}`}>
    <span class="label-icon">🌐</span>
    <span class="label-text">
      {selected === 'ru' ? 'Выберите язык' :
      selected === 'en' ? 'Choose language' :
      selected === 'de' ? 'Sprache wählen' :
      selected === 'fr' ? 'Choisissez la langue' :
      selected === 'es' ? 'Elige idioma' :
      selected === 'zh' ? '选择语言' :
      selected === 'ja' ? '言語を選択' :
      selected === 'it' ? 'Scegli la lingua' :
      selected === 'pl' ? 'Wybierz język' :
      selected === 'uk' ? 'Виберіть мову' :
      selected === 'kk' ? 'Тілді таңдаңыз' : 'Choose language'}
    </span>
  </label>

  <select
    id="lang-select"
    bind:value={selected}
    on:change={handleSelect}
    class="{formStyles.form} {formStyles.select} {formStyles.md}"
  >
    {#each languages as lang}
      <option value={lang.code}>{lang.name}</option>
    {/each}
  </select>

  <Button
    variant="primary"
    size="md"
    style="margin-top:1.3rem;width:100%;"
    onclick={applyLang}
  >
    {saveText[selected] || 'Save language'}
  </Button>

  <div style="margin-top:1rem;font-size:0.95rem;text-align:center;color:#999">
    {selected === 'ru' ? 'Текущий язык:' :
    selected === 'en' ? 'Current language:' :
    selected === 'de' ? 'Aktuelle Sprache:' :
    selected === 'fr' ? 'Langue actuelle:' :
    selected === 'es' ? 'Idioma actual:' :
    selected === 'zh' ? '当前语言:' :
    selected === 'ja' ? '現在の言語:' :
    selected === 'it' ? 'Lingua attuale:' :
    selected === 'pl' ? 'Obecny język:' :
    selected === 'uk' ? 'Поточна мова:' :
    selected === 'kk' ? 'Ағымдағы тіл:' : 'Current language:'}
    <strong style="margin-left:0.4em;">{languages.find(l => l.code === selected)?.name}</strong>
  </div>
</div>

<style>
  .label-icon {
    font-size: 1.1rem;
    margin-right: 0.5em;
  }
  .label-text {
    font-family: 'Courier New', monospace;
  }
</style>