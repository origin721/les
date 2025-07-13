<script lang="ts">
    import { Button } from "../../../components";
  import { lang_store } from "../../../stores/lang_store.svelte";
  import formStyles from "../../../styles/modules/forms.module.css";
    import { languages, saveText } from "../constants";



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