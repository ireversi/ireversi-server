const router = require('express').Router();

const PlayingModel = require('../../../../models/kai/PlayingModel.js');

const propFilter = '-_id -__v';

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .delete(async (req, res) => {
    await PlayingModel.remove(); // delete.testでsaveした内容を全て削除
    res.json(await PlayingModel.find({}, propFilter)); // 更新後のコレクションを取ってくる
  });

module.exports = router;
