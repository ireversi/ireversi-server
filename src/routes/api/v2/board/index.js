const router = require('express').Router();
const jwt = require('jsonwebtoken');
const PieceStore = require('../../../../models/v2/PieceStore.js');
const BoardStore = require('../../../../models/v2/BoardStore.js');
const calcCandidate = require('./calcCandidate.js');
const calcScore = require('./calcScore.js');
router.use('/specified_range', require('./specified_size.js'));

router.route('/')
  .get(async (req, res) => {
    // userIdを取得
    const jwtId = req.headers.authorization;
    const { userId } = jwt.decode(jwtId);
    // boardStoreより全体盤面を取得
    const entireBoard = PieceStore.getPieces();
    // candidatesの初期化
    PieceStore.deleteCandidates();
    // candidatesの取得
    const ans = calcCandidate.calc(userId, entireBoard);
    ans.forEach((elm) => {
      PieceStore.addCandidate(elm);
    });
    // scoreの取得
    const score = calcScore.calc(userId, entireBoard);
    PieceStore.addScore(score);
    // sizeはpiece/index.jsで送っている
    res.json(BoardStore.getBoard(userId));
  })
  .delete((req, res) => {
    PieceStore.deletePieces();
    res.sendStatus(204);
  });

module.exports = router;
