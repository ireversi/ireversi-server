
const router = require('express').Router();

const PlayingModel = require('../../../../models/kohski/PlayingModel.js');

const propfilter = '-_id -__v';

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .get(async (req, res) => {
    res.json(await PlayingModel.find({}, propfilter));
  });

module.exports = router;
