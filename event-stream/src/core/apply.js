// @ts-check

/**
 * @template {unknown} T
 * @param {() => T} cb 
 * @returns {T}
 */
export function apply(cb) {
  return cb();
}