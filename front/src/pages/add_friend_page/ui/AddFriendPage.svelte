<script lang="ts">
    import { onMount } from "svelte";
    import { PATHS } from "../../../local_back";
    import { shared_worker_store } from "../../../processes";
    import { Link, ROUTES } from "../../../routing";
    import { appAuthStore } from "../../../stores";
    import type { AccountDto } from "../../../local_back/modules/accounts_service";
    import type { AppAuthStore } from "../../../stores/app_auth_store/app_auth_store";
    import { copyTextToClipboard } from "../../../core";
    import { friendService } from "../../../api/libp2p/services/friendService";

    let accById: AppAuthStore["byId"] = {};
    let authList: AccountDto[] = $state([]);
    let peerId = $state("");

    let selectedAcc: AccountDto | undefined = $state(undefined);

    function clipYourPeerId() {
        copyTextToClipboard(peerId);
    }

    onMount(() => {
        return appAuthStore.subscribe((newList) => {
            accById = newList.byId;
            authList = Object.values(newList.byId);
        });
    });

    $effect(() => {
        //console.log({authList});
    });

    function addFriend(e: Event) {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);

        const friendPeerId = formData.get("friendPeerId");

        if (selectedAcc && friendPeerId) {
            friendService.add_friend({
                friendPeerId: friendPeerId as string,
                accId: selectedAcc.id,
            });
        }
    }

    (async () => {
        console.log({
            //sfdfsdf:
        });
    })();

    function changeAcc(e: Event) {
        (async function () {
            try {
                if (!selectedAcc) {
                    peerId = "";
                    return;
                }

                // TODO: сделать сброс что бы гонки не было при новом запросе
                peerId = await shared_worker_store.fetch({
                    path: PATHS.GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P,
                    body: {
                        accId: selectedAcc.id,
                    },
                });
            } catch (err) {
                peerId = "";
            }
        })();
        //console.log('myout', e.target?.value, e.target);
    }
</script>

<ul>
    <li><h1>Добавить друга</h1></li>
    <li><Link href={ROUTES.HOME}>На главную</Link></li>
</ul>

<div>
    <select on:change={changeAcc} bind:value={selectedAcc}>
        <option value={undefined}>Не выбрано</option>
        {#each authList as acc (acc.id)}
            <option value={acc}>{acc.namePub}</option>
        {/each}
    </select>
    <div>
        <h3 class="text-[var(--text-color-2)] mt-0 mb-0">Ваш peerId</h3>
        <p class="text-[var(--text-color-3)] mt-0 mb-0">{peerId}</p>
        <button on:click={clipYourPeerId} type="button">Скопировать</button>
    </div>
    <form on:submit={addFriend}>
        <label>
            <span>peerId друга</span>
            <input name="friendPeerId" />
        </label>
        <button type="submit">Добавить</button>
    </form>
    <hr />
</div>
