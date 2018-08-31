const router = require('express').Router();

const PlayingModel = require('../../../../models/matsuda/PlayingModel.js');

const adjacentVectors = [
  [0, 1], // [x, y]
  [1, 0],
  [0, -1],
  [-1, 0],
];

const vectors = [
  ...adjacentVectors,
  [-1, 1],
  [1, 1],
  [1, -1],
  [-1, -1],
];

const propFilter = '-_id -__v';

router.route('/graph')
  .get(async (req, res) => {
    const left = +req.query.l;
    const right = +req.query.r;
    const bottom = +req.query.b;
    const top = +req.query.t;
    const pieces = await PlayingModel.find(
      Number.isNaN(left + right + bottom + top)
        ? {}
        : {
          x: { $gte: left, $lte: right },
          y: { $gte: bottom, $lte: top },
        },
      propFilter,
    );

    const xMin = Math.min(...pieces.map(p => p.x));
    const xMax = Math.max(...pieces.map(p => p.x));
    const yMin = Math.min(...pieces.map(p => p.y));
    const yMax = Math.max(...pieces.map(p => p.y));
    const width = xMax - xMin + 1;
    const height = yMax - yMin + 1;

    res.send(`
  Y
    ┌${[...Array(width)].map(() => '────').join('┬')}┐
${[...Array(height)].map((a, rY) => `${`  ${height - rY - 1 + yMin} `.slice(-4)}│${[...Array(width)].map((b, x) => `  ${`${(pieces.find(p => p.x === x + xMin && p.y === height - rY - 1 + yMin) || {}).userId || ' '} `.slice(0, 4)}`.slice(-4)).join('│')}│`).join(`
    ├${[...Array(width)].map(() => '────').join('┼')}┤
`)}
    └${[...Array(width)].map(() => '────').join('┴')}┘
    ${[...Array(width)].map((c, x) => `   ${x + xMin} `.slice(-5)).join('')}  X
`.slice(1, -1));
  });

router.route('/')
  .get(async (req, res) => {
    const xMin = +req.query.l;
    const xMax = +req.query.r;
    const yMin = +req.query.b;
    const yMax = +req.query.t;
    res.json(await PlayingModel.find(
      Number.isNaN(xMin + xMax + yMin + yMax)
        ? {}
        : {
          x: { $gte: xMin, $lte: xMax },
          y: { $gte: yMin, $lte: yMax },
        },
      propFilter,
    ));
  })
  .post(async (req, res) => {
    const x = +req.body.x;
    const y = +req.body.y;
    const userId = +req.body.userId;

    const pieces = await PlayingModel.find({}, propFilter);
    if (pieces.find(p => p.x === x && p.y === y)) {
      res.json(pieces);
      return;
    }

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

    if (needsUpdatePieces.length === 0) {
      if (pieces.find(p => p.userId === userId)) {
        res.json(pieces);
        return;
      }

      let isAdjacent = false;
      for (let i = 0; i < adjacentVectors.length; i += 1) {
        const vector = adjacentVectors[i];
        if (pieces.find(
          p => p.x === x + vector[0] && p.y === y + vector[1] && p.userId !== userId,
        )) {
          isAdjacent = true;
          break;
        }
      }

      if (pieces.length > 0 && !isAdjacent) {
        res.json(pieces);
        return;
      }
    }

    await Promise.all([
      new PlayingModel({
        x,
        y,
        userId,
      }).save(),
      ...needsUpdatePieces.map(p => PlayingModel.updateOne(
        { x: p.x, y: p.y },
        { userId },
      )),
    ]);

    res.json(await PlayingModel.find({}, propFilter));
  });

module.exports = router;
