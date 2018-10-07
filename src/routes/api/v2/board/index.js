const router = require('express').Router();
const boardStore = require('../../../../models/v2/BoardStore.js');
const pieceStore = require('../../../../models/v2/PieceStore.js');
const calcCandidate = require('./calcCandidate.js');
const calcScore = require('./calcScore.js');
const calcSize = require('./calcSize.js');
router.use('/specified_range', require('./specified_size.js'));

router.route('/').get(async (req, res) => {
  // userIdを取得
  const userId = +req.query.userId;
  // boardStoreより全体盤面を取得
  const entireBoard = pieceStore.getPieces();
  // candidatesの初期化
  boardStore.initCandidates();
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
})
  .delete((req, res) => {
    pieceStore.deletePieces();
    res.sendStatus(204);
  });

module.exports = router;
