const router = require('express').Router();
// const pieceStore = require('../../../../models/v2/PieceStore.js');
const jwt = require('jsonwebtoken');
const pieceStore = require('../../../../models/v2/PieceStore.js');
const boardStore = require('../../../../models/v2/BoardStore.js');
const calcCandidate = require('./calcCandidate');
// const calcCandidate = require('./calcCandidate.js');
const calcScore = require('./calcScore.js');

// const calcSize = require('./calcSize.js');

router.route('/').get(async (req, res) => {
  // query数値を取得
  const jwtId = req.headers.authorization;
  const { userId } = jwt.decode(jwtId);
  const xMin = +req.query.x_min;
  const xMax = +req.query.x_max;
  const yMin = +req.query.y_min;
  const yMax = +req.query.y_max;
  const { pieces } = boardStore.getBoard();
  const ansPieces = [];

  pieces.forEach((elm) => {
    for (let i = xMin; i < xMax + 1; i += 1) {
      for (let k = yMin; k < yMax + 1; k += 1) {
        if (elm.x === i && elm.y === k) {
          ansPieces.push(elm.userId);
        }
      }
    }
  });

  const ansCandidates = calcCandidate.calc(userId, pieces);
  const ansScore = calcScore.calc(userId, pieces);
  const size = pieceStore.getSize();

  const answers = {
    pieces: ansPieces,
    candidates: ansCandidates,
    standbys: [],
    score: ansScore,
    size,
  };

  res.json(answers);
  // res.sendStatus(204);
});
module.exports = router;
