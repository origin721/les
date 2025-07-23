<script lang="ts">
    import { Link, ROUTES } from "../../routing";
    import formStyles from "../../styles/modules/forms.module.css";

    interface Props {
        accounts: any[];
        selectedAccountId: string;
        loading: boolean;
        onchange: (value: string) => void;
    }

    let {
        accounts,
        selectedAccountId,
        loading,
        onchange
    }: Props = $props();
</script>

<div class={formStyles.group}>
    <label for="account-select" class={`${formStyles.label} ${formStyles.labelRequired}`}>
        <span class="label-icon">👤</span>
        <span class="label-text">ВЫБЕРИТЕ АККАУНТ</span>
    </label>
    {#if accounts.length === 0}
        <div class="no-accounts">
            <span class="warning-icon">⚠️</span>
            <span>Нет доступных аккаунтов</span>
            <Link href={'#'+ROUTES.ACCOUNTS_NEW} className="create-account-link">
                Создать аккаунт
            </Link>
        </div>
    {:else}
        <select
            id="account-select"
            value={selectedAccountId}
            onchange={(e) => onchange((e.target as HTMLSelectElement).value)}
            class="{formStyles.form} {formStyles.select} {formStyles.md}"
            disabled={loading}
        >
            {#each accounts as account}
                <option value={account.id}>
                    {account.namePub} (ID: {account.id.slice(0, 8)}...)
                </option>
            {/each}
        </select>
    {/if}
</div>

<style>
    .label-icon {
        font-size: 1.1rem;
    }

    .label-text {
        font-family: 'Courier New', monospace;
    }

    .no-accounts {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 6px;
        color: #ef4444;
        text-align: center;
    }

    .warning-icon {
        font-size: 1.5rem;
    }

    :global(.create-account-link) {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        transition: all 0.3s ease;
    }

    :global(.create-account-link:hover) {
        background: var(--primary-color);
        color: #000;
        box-shadow: 0 0 15px var(--primary-color);
    }
</style>
