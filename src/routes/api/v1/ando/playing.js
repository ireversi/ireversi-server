const router = require('express').Router();

const PlayingModel = require('../../../../models/ando/PlayingModel.js');

router.route('/')
  .post(async (req, res) => {
    // res.json([
    //     {
    //         x: 0,
    //         y: 0,
    //         userId: 1,
    //     },
    //     {
    //         x: 1,
    //         y: 0,
    //         userId: 1,
    //     },
    //     {
    //         x: 2,
    //         y: 0,
    //         userId: 1
    //     }
    // ]);
    const Playing = new PlayingModel({
      x: req.body.x,
      y: req.body.y,
      userId: req.body.userId,
    });
    await Playing.save();

    const playingAll = await PlayingModel.find({}, { __v: 0, _id: 0 });

    // const minX = Math.min.apply(null, playingAll.map(function(data){return data.x;}));
    // const maxX = Math.max.apply(null, playingAll.map(function(data){return data.x;}));

    // for(let i = 0; i < playingAll; i++) {
    //     playingAll[i].x;
    // }

    res.json(playingAll);
  });

module.exports = router;
