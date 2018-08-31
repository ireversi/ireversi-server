const router = require('express').Router();

const PlayingModel = require('../../../../models/matsuda/PlayingModel.js');

const vectors = [
  [-1, 1], // [x, y]
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
];

router.route('/')
  .post(async (req, res) => {
    const x = +req.body.x;
    const y = +req.body.y;
    const userId = +req.body.userId;

    const pieces = await PlayingModel.find({});
    if (pieces.find(p => p.x === x && p.y === y)) {
      res.json(pieces);
      return;
    }

    const Playing = new PlayingModel({
      x,
      y,
      userId,
    });
    await Playing.save();

    const needsUpdatePieces = [];

    for (let i = 0; i < vectors.length; i += 1) {
      const vector = vectors[i];
      const candidates = [];
      let n = 1;
      let target = pieces.find(p => p.x === x + vector[0] && p.y === y + vector[1]);
      let turnable = false;

      while (target) {
        if (target.userId === userId) {
          turnable = true;
          break;
        } else {
          candidates.push(target);
          n += 1;
          // eslint-disable-next-line no-loop-func
          target = pieces.find(p => p.x === x + vector[0] * n && p.y === y + vector[1] * n);
        }
      }

      if (turnable) needsUpdatePieces.push(...candidates);
    }

    await Promise.all(needsUpdatePieces.map(p => PlayingModel.updateOne(
      // eslint-disable-next-line no-underscore-dangle
      { _id: p._id },
      { userId },
    )));

    res.json(await PlayingModel.find({}));
  });

module.exports = router;
