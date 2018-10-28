const jwt = require('jsonwebtoken');
const getHash = require('random-hash');

function genHash() {
  let tempHash = '';
  let flag = 0; // 0ならダメ。1ならOK。
  // getHash関数だと'-','_'も入ってしまうのでそれがなくなるまでhashを発行し続ける。
  while (flag === 0) {
    tempHash = getHash.generateHash({ length: 6 });
    if (tempHash.indexOf('-') === -1 && tempHash.indexOf('_') === -1) {
      flag = 1;
    }
  }
  return tempHash;
}

exports.generate = function generateToken() {
  const userId = genHash();
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
