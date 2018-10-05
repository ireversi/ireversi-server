const router = require('express').Router();
// const pieceStore = require('../../../../models/v2/PieceStore.js');
const boardStore = require('../../../../models/v2/BoardStore.js');
const calcCandidate = require('./calcCandidate');
// const calcCandidate = require('./calcCandidate.js');
const calcScore = require('./calcScore.js');
// const calcSize = require('./calcSize.js');


// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/').get(async (req, res) => {
  // query数値を取得
  const userId = +req.query.userId;
  const xMin = +req.query.x_min;
  const xMax = +req.query.x_max;
  const yMin = +req.query.y_min;
  const yMax = +req.query.y_max;
  const entireBoard = boardStore.getBoard().pieces;
  const ansPieces = [];

  entireBoard.forEach((elm) => {
    for (let i = xMin; i < xMax + 1; i += 1) {
      for (let k = yMin; k < yMax + 1; k += 1) {
        if (elm.x === i && elm.y === k) {
          ansPieces.push(elm);
        }
      }
    }
  });

  const ansCandidates = calcCandidate.calc(userId, entireBoard);
  const ansScore = calcScore.calc(userId, entireBoard);

  const answers = {
    pieces: ansPieces,
    candidates: ansCandidates,
    standbys: [],
    score: ansScore,
    size: {
      x_min: xMin,
      x_max: xMax,
      y_min: yMin,
      y_max: yMax,
    },
  };


  res.json(answers);
  // res.sendStatus(204);
});
module.exports = router;
