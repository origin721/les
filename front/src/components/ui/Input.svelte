<script lang="ts">
  import formStyles from '../../styles/modules/forms.module.css';
  
  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    state?: 'default' | 'error' | 'success';
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    value?: string;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onkeydown?: (event: KeyboardEvent) => void;
    id?: string;
    className?: string;
  }
  
  let {
    type = 'text',
    size = 'md',
    state = 'default',
    disabled = false,
    readonly = false,
    placeholder = '',
    value = $bindable(''),
    oninput,
    onchange,
    onkeydown,
    id,
    className = '',
    ...restProps
  }: Props = $props();
  
  const getInputClasses = () => {
    let classes = [formStyles.form, formStyles.input, formStyles[size]];
    
    if (state === 'error') classes.push(formStyles.error);
    if (state === 'success') classes.push(formStyles.success);
    if (disabled) classes.push(formStyles.disabled);
    if (readonly) classes.push(formStyles.readonly);
    if (className) classes.push(className);
    
    return classes.join(' ');
  };
</script>

<input
  {type}
  {id}
  class={getInputClasses()}
  {disabled}
  {readonly}
  {placeholder}
  bind:value
  {oninput}
  {onchange}
  {onkeydown}
  {...restProps}
/>
