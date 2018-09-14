const router = require('express').Router();

const PlayingModel = require('../../../../models/kai/PlayingModel.js');

const propFilter = '-_id -__v';

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
// res.jsonでresponse.bodyに返す
  .get(async (req, res) => {
    res.json(await PlayingModel.find({}, propFilter)); // 全体のデータを取ってくる
  });

module.exports = router;
