const router = require('express').Router();

const PlayingModel = require('../../../../models/matsui/PlayingModel.js');

router.route('/')
  .get(async (req, res) => {
    res.json(await UserModel.findOne({ name: req.query.name }));
  })
  .post(async (req, res) => {
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };
    const Play = new PlayingModel(result);

    await Play.save();
    res.json([result]);
  });

module.exports = router;
