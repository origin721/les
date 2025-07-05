<script lang="ts">
    import { writable } from "svelte/store";
    import { ROUTES } from "../../../routing";
    import { appAuthStore } from "../../../stores";
    import { routingStore } from "../../../routing/stores";
    import { uuidv4 } from "../../../core/uuid";
    import type { HttpServerParam } from "../../../indexdb/main_les_store_v1/accounts/add_accounts";
    import { FieldHttpServers } from "../../../widgets";
    import { PageLayout, FormContainer, FormField, BackLink } from "../../../components/ui";

    let fieldLogin = $state("");
    let fieldPass = $state("");
    const defaultHttpParam: HttpServerParam = {
        url: location.protocol + "//" + location.host,
        isActive: true,
        id: uuidv4(),
    };
    const fieldHttpServers = writable([defaultHttpParam]);

    function submit(e: Event) {
        e.preventDefault();
        appAuthStore.add({
            namePub: fieldLogin,
            pass: fieldPass,
            httpServers: $fieldHttpServers,
        });

        routingStore.setPath(ROUTES.ACCOUNTS);
    }
</script>

<PageLayout
    title="СОЗДАНИЕ_АККАУНТА"
    subtitle="РЕГИСТРАЦИЯ_НОВОГО_ПОЛЬЗОВАТЕЛЯ"
    statusText="СИСТЕМА ГОТОВА"
    backButtonHref={ROUTES.ACCOUNTS}
    backButtonText="← АККАУНТЫ"
    version="0.0.1"
    versionPrefix="ACCOUNT_SYSTEM_v"
>
    {#snippet children()}
        <FormContainer onsubmit={submit}>
            <FormField 
                label="login" 
                bind:value={fieldLogin} 
                type="text" 
                required 
            />
            
            <FormField 
                label="pass" 
                bind:value={fieldPass} 
                type="password" 
                required 
                className="mb-[1rem]"
            />

            <FieldHttpServers {fieldHttpServers} />

            <button
                type="submit"
                class="border-2 border-solid p-2 min-w-[6rem] m-7 rounded-md transition-colors duration-200"
                style="
                    background-color: var(--les-bg-secondary);
                    border-color: var(--les-border-primary);
                    color: var(--les-text-primary);
                "
            >
                submit
            </button>
        </FormContainer>
    {/snippet}
</PageLayout>
