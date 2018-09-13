const router = require('express').Router();

const PlayingModel = require('../../../../models/momii/PlayingModel.js');

router.route('/')
  .post(async (req, res) => {
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };
    const Playing = new PlayingModel(result);

    await Playing.save();
    res.json([result]);
  });

module.exports = router;
