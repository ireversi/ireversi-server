const router = require('express').Router();
const boardStore = require('../../../../models/v2/BoardStore.js');
const pieceStore = require('../../../../models/v2/PieceStore.js');
const calcCandidate = require('./calcCandidate.js');
const calcScore = require('./calcScore.js');
const calcSize = require('./calcSize.js');
router.use('/specified_range', require('./specified_range.js'));

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/').get(async (req, res) => {
  // userIdを取得
  const userId = +req.query.userId;
  // boardStoreより全体盤面を取得
  const entireBoard = pieceStore.getPieces();
  // candidatesの取得
  const ans = calcCandidate.calc(userId, entireBoard);
  ans.forEach((elm) => {
    boardStore.addCandidates(elm);
  });
  // scoreの取得
  const score = calcScore.calc(userId, entireBoard);
  boardStore.addScore(score);
  // sizeの取得
  const size = calcSize.calc(userId, entireBoard);
  boardStore.addSize(size);
  res.json(boardStore.getBoard());
});

module.exports = router;
