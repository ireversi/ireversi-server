const router = require('express').Router();

const UserModel = require('../../../models/UserModel.js');

router.route('/') // 最後の処理として受け止める
  .get(async (req, res) => { // reqで受け、resで返す.HTTP接続のルール
    res.json(await UserModel.findOne({ name: req.query.name }));// users.test.jsのbodyに戻る
  })
  .post(async (req, res) => {
    const User = new UserModel({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    User.setInitParams();
    await User.save();
    res.json({ status: 'success' });
  });

module.exports = router;
