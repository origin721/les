/**
 * Позволяет создавать объекты где ключи равны значениям
 * типо
 * MyTypes = {
 *   PATH_NAME_1: 'PATH_NAME_1',
 *   PATH_NAME_2: 'PATH_NAME_2',
 * }
 * Если будет не соответствие будет ругаться
 * MyTypes = {
 *   PATH_NAME_1: 'PATH_NAME_1',
 *   PATH_NAME_2: 'err!',
 * }
 * Types of property 'PATH_NAME_1' are incompatible.
    Type 'string' is not assignable to type 'never'.
 */
export type MyEnum<T> = {
  [key in keyof T]: T[key] extends key
    ? key
    : never;
}