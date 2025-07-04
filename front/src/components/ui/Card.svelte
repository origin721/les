<script lang="ts">
  import cardStyles from '../../styles/modules/cards.module.css';
  
  interface Props {
    variant?: 'default' | 'elevated' | 'interactive' | 'glowing' | 'flat';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    effect?: 'shimmer' | 'pulse' | 'float';
    onclick?: () => void;
    className?: string;
    children?: any;
  }
  
  let {
    variant = 'default',
    size = 'md',
    effect,
    onclick,
    className = '',
    children,
    ...restProps
  }: Props = $props();
  
  const getCardClasses = () => {
    let classes = [cardStyles.card, cardStyles[size], cardStyles[variant]];
    
    if (effect) classes.push(cardStyles[effect]);
    if (className) classes.push(className);
    
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
