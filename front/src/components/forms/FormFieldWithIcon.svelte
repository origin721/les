<script lang="ts">
    import { Input } from "../ui";
    import formStyles from "../../styles/modules/forms.module.css";

    interface Props {
        id: string;
        label: string;
        icon?: string;
        value: string;
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        onchange: (value: string) => void;
        onkeydown?: (event: KeyboardEvent) => void;
    }

    let {
        id,
        label,
        icon = "📝",
        value,
        placeholder = "",
        required = false,
        disabled = false,
        onchange,
        onkeydown
    }: Props = $props();
    
    function handleInputChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (onchange) {
            onchange(target.value);
        }
    }
</script>

<div class={formStyles.group}>
    <label for={id} class={`${formStyles.label} ${required ? formStyles.labelRequired : ''}`}>
        <span class="label-icon">{icon}</span>
        <span class="label-text">{label}</span>
    </label>
    <Input
        {id}
        {value}
        onchange={handleInputChange}
        {onkeydown}
        {placeholder}
        {disabled}
    />
</div>

<style>
    .label-icon {
        font-size: 1.1rem;
    }

    .label-text {
        font-family: 'Courier New', monospace;
    }
</style>
