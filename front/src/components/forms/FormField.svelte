<script lang="ts">
  interface Props {
    label: string;
    type?: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    labelClass?: string;
    inputClass?: string;
    onchange?: (value: string) => void;
  }

  let {
    label,
    type = "text",
    value = $bindable(""),
    placeholder = "",
    required = false,
    className = "",
    labelClass = "mt-3 mb-3",
    inputClass = "px-3 py-2 border rounded-md transition-colors duration-200",
    onchange
  }: Props = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    onchange?.(target.value);
  }
</script>

<label class="{labelClass} {className}">
  <span class="block">{label}</span>
  <input 
    {type}
    {value}
    {placeholder}
    {required}
    class={inputClass}
    oninput={handleInput}
  />
</label>
