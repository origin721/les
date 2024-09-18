// @ts-check

module.exports = {create_empty_entity};

/**
 * @template T
 */
function create_empty_entity() {
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