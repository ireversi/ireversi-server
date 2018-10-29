const router = require('express').Router();
const generateToken = require('./generateToken');

router.route('/').post((req, res) => {
  const accessToken = generateToken.generate();
  res.json({ accessToken });
});

module.exports = router;
