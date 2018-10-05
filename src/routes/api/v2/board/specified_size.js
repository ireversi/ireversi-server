const router = require('express').Router();
const boardStore = require('../../../../models/v2/BoardStore.js');
// const pieceStore = require('../../../../models/v2/PieceStore.js');
// const calcCandidate = require('./calcCandidate.js');
// const calcScore = require('./calcScore.js');
// const calcSize = require('./calcSize.js');


// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .get(async (req, res) => {
    // // query数値を取得
    // const userId = +req.query.userId;
    // const xMin = +req.query.x_min;
    // const xMax = +req.query.x_max;
    // const yMin = +req.query.y_min;
    // const yMax = +req.query.y_max;

    // // boardStoreより全体盤面を取得
    // const entireBoard = pieceStore.getPieces();


    res.json(boardStore.getBoard());
    res.sendStatus(204);
  });
module.exports = router;
