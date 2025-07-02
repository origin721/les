<script lang="ts">
  import buttonStyles from '../../styles/modules/buttons.module.css';
  
  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: () => void;
    children?: any;
  }
  
  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    onclick,
    children,
    ...restProps
  }: Props = $props();
  
  const getButtonClasses = () => {
    let classes = [buttonStyles.button, buttonStyles[size], buttonStyles[variant]];
    
    if (disabled) classes.push(buttonStyles.disabled);
    if (loading) classes.push(buttonStyles.loading);
    
    return classes.join(' ');
  };
</script>

<button
  {type}
  class={getButtonClasses()}
  {disabled}
  onclick={onclick}
  {...restProps}
>
  {@render children?.()}
</button>
