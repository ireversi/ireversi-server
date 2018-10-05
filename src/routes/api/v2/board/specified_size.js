const router = require('express').Router();
// const boardStore = require('../../../../models/v2/BoardStore.js');
const pieceStore = require('../../../../models/v2/PieceStore.js');
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
    // query数値を取得
    const xMin = +req.query.x_min;
    const xMax = +req.query.x_max;
    const yMin = +req.query.y_min;
    const yMax = +req.query.y_max;
    const entireBoard = pieceStore.getPieces();
    let ansX = 0;
    let ansY = 0;
    let ansId = 0;
    let ansPiece = {};
    const ansPieces = [];

    entireBoard.forEach((elm) => {
      for (let i = xMin; i < xMax + 1; i += 1) {
        for (let k = yMin; k < yMax + 1; k += 1) {
          if (elm.x === i && elm.y === k) {
            ansX = elm.x - xMin;
            ansY = elm.y - yMin;
            ansId = elm.userId;
            ansPiece = {
              x: ansX,
              y: ansY,
              userId: ansId,
            };
            ansPieces.push(ansPiece);
          }
        }
      }
    });
    res.json(ansPieces);
    // res.sendStatus(204);
  });
module.exports = router;
