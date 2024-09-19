// @ts-check

module.exports = {create_safe_result};

/**
 * @template T
 */
function create_safe_result() {
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