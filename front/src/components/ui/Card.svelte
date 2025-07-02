<script lang="ts">
  import cardStyles from '../../styles/modules/cards.module.css';
  
  interface Props {
    variant?: 'default' | 'elevated' | 'interactive' | 'glowing' | 'flat';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    effect?: 'shimmer' | 'pulse' | 'float';
    onclick?: () => void;
    children?: any;
  }
  
  let {
    variant = 'default',
    size = 'md',
    effect,
    onclick,
    children,
    ...restProps
  }: Props = $props();
  
  const getCardClasses = () => {
    let classes = [cardStyles.card, cardStyles[size], cardStyles[variant]];
    
    if (effect) classes.push(cardStyles[effect]);
    
    return classes.join(' ');
  };
</script>

<div
  class={getCardClasses()}
  onclick={onclick}
  role={onclick ? 'button' : undefined}
  {...(onclick ? { tabindex: 0 } : {})}
  {...restProps}
>
  {@render children?.()}
</div>
