
const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');

// const waitTime = 3500;
// const dateNow = Date.now();

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post((req, res) => {
    const pieces = PieceStore.getPieces();

    const piece = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };
    console.log(piece);


    // console.log(dateNow);
    // console.log(dateNow - Date.now());

    PieceStore.addPiece(piece); // コマを置く
    res.send(pieces);
  });
module.exports = router;
