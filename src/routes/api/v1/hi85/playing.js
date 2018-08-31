const router = require('express').Router();

const Hi85PlayingModel = require('../../../../models/hi85/PlayingModel.js');

router
  .route('/')
  .get(async (req, res) => {
    res.json(await Hi85PlayingModel.findOne({ user_id: req.query.user_id }));
  })
  .post(async (req, res) => {
    const hi85Playing = new Hi85PlayingModel({
      x: req.body.x,
      y: req.body.y,
      user_id: req.body.user_id,
    });
    await hi85Playing.save();
    res.json({ status: 'success' });
  });

module.exports = router;
