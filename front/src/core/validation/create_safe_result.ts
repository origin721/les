
/**
 * @template T
 */
export function create_safe_result() {
  /**
   * @type {import('./types/SafeResult').SafeResult<T|null>}
   */
  const new_entity = {
    is_ok: false,
    err_messages: [],
    result: null,
  };

  return new_entity;
}

export type SafeResult<T> = {
  is_ok: boolean;
  err_messages: ErrorEntity[];
  result: T;
}


export const ERROR_TYPES = Object.freeze({
  INVALID_PARAMS: 'INVALID_PARAMS'
});

type ErrorEntity = {
  type: keyof typeof ERROR_TYPES;
  message: string;
}