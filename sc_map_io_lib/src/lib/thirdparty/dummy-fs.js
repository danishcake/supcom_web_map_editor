/**
 * Dummy readFileSync for lua
 */
module.exports.readFileSync = function(filename) {
  throw new Error('Sir, this is a browser. Put down the chair');
}

