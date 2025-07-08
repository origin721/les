import { PATHS } from "../../local_back/constant/PATHS";
import { shared_worker_store } from "../../processes/shared_worker/shared_worker_store";
import type { Account } from "../../indexdb/main_les_store_v1/entities/accounts/get_accounts";


/**
 * Основной API для работы с backend через shared worker
 */
export const accounts = {
  /**
   * Войти в аккаунт
   */
  async login(pass: string): Promise<void> {
    await shared_worker_store.fetch({
      path: PATHS.LOGIN,
      body: { pass }
    });
  },

  /**
   * Получить список аккаунтов
   */
  async getList(): Promise<Account[]> {
    const result = await shared_worker_store.fetch({
      path: PATHS.GET_ACCOUNTS
    });
    return result as Account[];
  }
}