const router = require('express').Router();
const boardCtrl = require('../../../../models/v2/boardController.js');
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
  const userId = +req.query.user_id;
  // boardCtrlより全体盤面を取得
  const entireBoard = boardCtrl.getBoard().pieces;
  // candidatesの取得
  const ans = calcCandidate.calc(userId, entireBoard);
  ans.forEach((elm) => {
    boardCtrl.addCandidates(elm);
  });
  // scoreの取得
  const score = calcScore.calc(userId, entireBoard);
  boardCtrl.addScore(score);
  // sizeの取得
  const size = calcSize.calc(userId, entireBoard);
  boardCtrl.addSize(size);
  res.json(boardCtrl.getBoard());
});

module.exports = router;
