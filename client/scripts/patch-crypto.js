// Patch crypto for Node.js 17+ compatibility
const crypto = require('crypto');
const originalCreateHash = crypto.createHash;

crypto.createHash = function(algorithm) {
  if (algorithm === 'md4') {
    return originalCreateHash.call(this, 'md5');
  }
  return originalCreateHash.call(this, algorithm);
};

