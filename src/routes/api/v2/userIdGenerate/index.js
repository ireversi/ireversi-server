const router = require('express').Router();
const jwt = require('jsonwebtoken');
const getHash = require('random-hash');

function generateToken() {
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
}

router.route('/').post((req, res) => {
  const accessToken = generateToken();
  res.json({ accessToken });
});

module.exports = router;
