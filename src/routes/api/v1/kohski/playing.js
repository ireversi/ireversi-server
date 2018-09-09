const router = require('express').Router();
const PlayingModel = require('../../../../models/kohski/PlayingModel.js');

const propFilter = '-_id -__v';

router.route('/')
  .post(async (req, res) => {
    const pieces = await PlayingModel.find({}, propFilter);
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userID: +req.body.userID,
    };

    // console.log(result);

    if (pieces.find(p => p.x === result.x && p.y === result.y)) {
      res.json(pieces);
      return;
    }
    const Playing = new PlayingModel(result);
    await Playing.save();
    res.json(await PlayingModel.find({}, propFilter));
  });

module.exports = router;
