const router = require('express').Router();
const BoardStore = require('../../../../models/v2/BoardStore.js');
const PieceStore = require('../../../../models/v2/PieceStore.js');
const calcCandidate = require('./calcCandidate.js');
const calcScore = require('./calcScore.js');
const calcSize = require('./calcSize.js');
router.use('/specified_range', require('./specified_size.js'));

router.route('/').get(async (req, res) => {
  // userIdを取得
  const userId = +req.query.userId;
  // boardStoreより全体盤面を取得
  const entireBoard = PieceStore.getPieces();
  console.log(entireBoard);

  // candidatesの初期化
  BoardStore.initCandidates();
  // candidatesの取得
  const ans = calcCandidate.calc(userId, entireBoard);
  ans.forEach((elm) => {
    BoardStore.addCandidates(elm);
  });
  // scoreの取得
  const score = calcScore.calc(userId, entireBoard);
  BoardStore.addScore(score);
  // sizeの取得
  const size = calcSize.calc(userId, entireBoard);
  BoardStore.addSize(size);
  res.json(BoardStore.getBoard());
})
  .delete((req, res) => {
    PieceStore.deletePieces();
    res.sendStatus(204);
  });

module.exports = router;
