const router = require('express').Router();
const PlayingModel = require('../../../../models/kohski/PlayingModel.js');

const propFilter = '-_id -__v';

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post(async (req, res) => {
    // piecesは多分盤面においてある全部のpiece
    const pieces = await PlayingModel.find({}, propFilter);
    // playing.test.jsでpostされてきた一つ文のピースの座標
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userID: +req.body.userID,
    };

    // if the piece has already exist, return the original array
    if (pieces.find(p => p.x === result.x && p.y === result.y)) {
      res.json(pieces);
      return;
    }

    const Playing = new PlayingModel(result);
    await Playing.save();
    res.json(await PlayingModel.find({}, propFilter));
  });

module.exports = router;
