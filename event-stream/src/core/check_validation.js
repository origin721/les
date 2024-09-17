// @ts-check


module.exports = {
    check_validation,
}

function check_validation(cb) {
    try {
      return cb();
    }
    catch (err) {
      return null;
    }
  }
