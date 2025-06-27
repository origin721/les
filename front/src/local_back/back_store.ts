import type { Account } from "../indexdb/accounts/get_accounts";

export const back_store = {
  accounts_by_id: {} as Record<string, Account>,
  friendsLibp2p: { } as Record<string, >,
}