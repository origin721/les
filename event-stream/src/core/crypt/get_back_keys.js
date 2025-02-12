// @ts-check

import { 
  create_recursive_dir_by_path,
  read_json_from_file,
  write_or_create_file,
} from '../fs/index.js';
import { APP_LOCAL_STORE_DIR_PATH } from '../../constants/APP_LOCAL_STORE_DIR_PATH.js';
import { APP_LOCAL_STORE_PATHS } from '../../constants/APP_LOCAL_STORE_PATHS.js';
import { check_curve25519_valid_keys } from './libsodium-wrappers/check_curve25519_valid_keys.js';
import { generate_keys_curve25519 } from './libsodium-wrappers/generate_keys_curve25519.js';
import { generate_keys_ed25519 } from './libsodium-wrappers/generate_keys_ed25519.js';
import { check_ed25519_valid_keys } from './libsodium-wrappers/check_ed25519_valid_keys.js';


let cache_result = null;

//get_back_keys().then(console.log);

/**
 * Если ключей не было то создаёт и добавляет в секреты, если были то читает
 * @returns {Promise<SecretConfig>}
 */
export async function get_back_keys() {
    if(cache_result) {
      return cache_result;
    }


    try {
      await create_recursive_dir_by_path(APP_LOCAL_STORE_DIR_PATH);
    }
    catch(err) {
      console.error('Ошибка создание директории для локального хранилища: ' + APP_LOCAL_STORE_DIR_PATH, err);
      throw err;
    }

    /**
     * @type {null|SecretConfig}
     */
    const secret_config = await read_json_from_file(
      APP_LOCAL_STORE_PATHS.SECRETS,
    );

    //console.log({secret_config});

    if(secret_config === null) {
      const new_config = await generate_full_new_secret_config();
      await write_or_create_file(
        APP_LOCAL_STORE_PATHS.SECRETS,
        JSON.stringify(new_config),
      );
      cache_result = new_config;
      return cache_result;
    }

    let new_secret_config = {...secret_config};

    if(!await check_valid_config_curve25519(new_secret_config)) {
      Object.assign(new_secret_config, await generate_config_curve25519());
    }

    if(!await check_valid_config_ed25519(new_secret_config)) {
      Object.assign(new_secret_config, await generate_config_ed25519());
    }

    cache_result = new_secret_config;

    return cache_result;
}

/**
 * 
 * @returns {Promise<SecretConfig>}
 */
async function generate_full_new_secret_config() {
  return Object.assign(
    {},
    await generate_config_curve25519(),
    await generate_config_ed25519(),
  );
}

/**
 * 
 * @param {SecretConfig} secret_config 
 * @returns {Promise<boolean>}
 */
async function check_valid_config_curve25519(secret_config) {
  try {
    if(
      typeof secret_config.privateKeyCurve25519 === 'string'
      && typeof secret_config.publicKeyCurve25519 === 'string'
      && await check_curve25519_valid_keys({
        publicKey: secret_config.privateKeyCurve25519,
        privateKey: secret_config.privateKeyCurve25519,
      })
    ) {
      return true;
    }
  }
  catch(err) {
  }
  return false;
}

/**
 * 
 * @param {SecretConfig} secret_config 
 * @returns {Promise<boolean>}
 */
async function check_valid_config_ed25519(secret_config) {
  try {
    if(
      typeof secret_config.privateKeyEd25519 === 'string'
      && typeof secret_config.publicKeyEd25519 === 'string'
      && await check_ed25519_valid_keys({
        publicKey: secret_config.publicKeyEd25519,
        privateKey: secret_config.privateKeyEd25519,
      })
    ) {
      return true;
    }
  }
  catch(err) {
  }
  return false;
}

/**
 * @returns {Promise<Pick<
 * SecretConfig,
 * 'privateKeyCurve25519'|'publicKeyCurve25519'
 * >>}
 */
async function generate_config_curve25519() {
  const curve25519_keys = await generate_keys_curve25519();

  console.log();
  console.log('# # # # # # #');
  console.log('Были созданы новые backend ключи curve25519');
  console.log(new Date());

  return {
    privateKeyCurve25519: curve25519_keys.privateKey,
    publicKeyCurve25519: curve25519_keys.publicKey,
  }
}

/**
 * @returns {Promise<Pick<
 * SecretConfig,
 * 'privateKeyEd25519'|'publicKeyEd25519'
 * >>}
 */
async function generate_config_ed25519() {
  const ed25519_keys = await generate_keys_ed25519();

  console.log();
  console.log('# # # # # # #');
  console.log('Были созданы новые backend ключи ed25519');
  console.log(new Date());

  return {
    privateKeyEd25519: ed25519_keys.privateKey,
    publicKeyEd25519: ed25519_keys.publicKey,
  }
}


/**
 * @typedef {import('../../types/configs').SecretConfig} SecretConfig
 */