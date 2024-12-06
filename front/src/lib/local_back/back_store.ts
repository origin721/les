import type { Account } from "../core/indexdb/accounts/get_accounts";

export const back_store = {
  accounts_by_id: {} as Record<string, Account>,
}