// @ts-check

export const app_config = /** @type {AppConfig} */({
  pathToTheLocalStorage: {
    type: 'RELATIVE',
    path: '.appLocalStorage',
  },
})

/**
 * @typedef {Object} AppConfig
 * @prop {Object} pathToTheLocalStorage
 * Путь для хранения данных в проекте например сгенерированные ключи и прочии данные которые могут сохранятся без подключения к database
 * @prop {'RELATIVE'|'ABSOLUTE'} pathToTheLocalStorage.type
 * Путь относительно корня проекта "RELATIVE" или абсолютный "ABSOLUTE" путь
 * @prop {string} pathToTheLocalStorage.path
 * путь типо "/home/username/mydir"
 * 
 */