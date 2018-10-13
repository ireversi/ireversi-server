const router = require('express').Router();
const jwt = require('jsonwebtoken');
// const passport = require('passport');

router.route('/').post((req, res) => {
  const headerValue = req.headers.accesstoken;
  const accessToken = jwt.decode(headerValue);

  const isUserId = (Object.keys(accessToken).indexOf('userId') !== -1);

  let status = '';
  if (isUserId) {
    const userIdParse = accessToken.userId;
    console.log(userIdParse);
    status = 'success';
  } else {
    status = 'false';
  }
  res.json(status);
});

module.exports = router;
