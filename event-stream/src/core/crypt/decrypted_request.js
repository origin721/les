// @ts-check

module.exports = {

}

const algorithm_types = Object.freeze({
  pgp_ed25519: 'pgp_ed25519',
})

/**
 * 
 * @param {Param} requestBody 
 */
async function decrypted_request(requestBody) {
  try {
    switch(requestBody.algorithm) {
      case algorithm_types.pgp_ed25519:
        
    }
  }
  catch(err) {
    console.error('Ошибка при расшифровке request', err);
    return null
  }


}

/**
 * @typedef {Object} Param
 * @prop {string} algorithm
 * @prop {string} encrypted_data
 */