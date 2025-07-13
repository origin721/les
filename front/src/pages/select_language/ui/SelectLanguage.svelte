<script>
    import { lang_store } from "../../../stores/lang_store.svelte";

  // Массив поддерживаемых языков
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'de', name: 'Deutsch' },
    // Добавьте нужные языки
  ];

  let selected = $state('en');

  function applyLang() {
    console.log('selectedLang', selected);
    lang_store.state = selected;
  }

  // Функция для смены языка
  function handleSelect(event) {
    selected = event.target.value;
    // Здесь можно добавить логику смены языка через i18n
    // Например: $i18n.setLocale(selected)
  }
</script>

<h1>Выберите язык</h1>
<select bind:value={selected} onchange={handleSelect}>
  {#each languages as lang}
    <option value={lang.code}>{lang.name}</option>
  {/each}
</select>

<button onclick={() => applyLang()}>Ok</button>

<p>Текущий язык: {selected}</p>

<style>
  h1 {
    margin-bottom: 1rem;
  }
  select {
    padding: 0.5rem;
    font-size: 1rem;
  }
</style>