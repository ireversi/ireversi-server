const router = require('express').Router();
const jwt = require('jsonwebtoken');
const generateToken = require('./generateToken');

router.route('/').post((req, res) => {
  const ans = {};
  const accessToken = generateToken.generate();
  const { userId } = jwt.decode(accessToken);
  const { username } = req.body;

  // 正規表現でusernameのvalidation
  // 数値、アルファベット、_以外が出たらtrueを返す正規表現
  const reg = /^[a-z0-9]([_a-z0-9]){2,13}[a-z0-9]$/;

  // 禁止文字の検索、最短の検索、最長の検索
  if (reg.test(username) && username !== null && username !== undefined) {
    ans.accessToken = accessToken;
    ans.userId = userId;
    ans.username = username;
  } else {
    ans.accessToken = null;
    ans.userId = null;
    ans.username = null;
  }
  res.json(ans);
});

module.exports = router;
