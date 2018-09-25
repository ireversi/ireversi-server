const router = require('express').Router();
const boardCtrl = require('../../../../models/v2/boardController.js');
const calcCandidate = require('./calcCandidate.js');
const calcScore = require('./calcScore.js');
router.use('/specified_range', require('./specified_range.js'));

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/').get(async (req, res) => {
  const userId = +req.query.user_id;
  const entireBoard = boardCtrl.getBoard().pieces;
  const ans = calcCandidate.calc(userId, entireBoard);
  ans.forEach((elm) => {
    boardCtrl.addCandidates(elm);
  });
  const score = calcScore.calc(userId, entireBoard);
  boardCtrl.addScore(score);
  res.json(boardCtrl.getBoard());
});

module.exports = router;
