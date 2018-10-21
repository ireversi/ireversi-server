const jwt = require('jsonwebtoken');
const getHash = require('random-hash');

exports.generate = function generateToken() {
  const userId = getHash.generateHash({ length: 6 });
  const token = jwt.sign(
    {
      userId,
    },
    'secret',
    {
      algorithm: 'HS256',
      noTimestamp: true,
    },
  );
  return token;
};
