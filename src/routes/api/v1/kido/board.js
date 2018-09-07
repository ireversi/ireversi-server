
const router = require('express').Router();

const PieceModel = require('../../../../models/kido/PieceModel.js');

const propfilter = '-_id -__v';

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .get(async (req, res) => {
    res.json(await PieceModel.find({}, propfilter));
  });

module.exports = router;
