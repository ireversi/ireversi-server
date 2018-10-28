const router = require('express').Router();
const jwt = require('jsonwebtoken');
const generateToken = require('./generateToken');

router.route('/').post((req, res) => {
  const accessToken = generateToken.generate();
  const { userId } = jwt.decode(accessToken);
  res.json({ accessToken, userId });
});

module.exports = router;
