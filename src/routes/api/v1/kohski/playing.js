const router = require('express').Router();
const PlayingModel = require('../../../../models/kohski/PlayingModel.js');

const propFilter = '-_id -__v';

// const dirArr = [
//   [0, 1], // n
//   [1, 1], // ne
//   [1, 0], // e
//   [1, -1], // se
//   [0, -1], // s
//   [-1, -1], // sw
//   [-1, 0], // w
//   [-1, 1], // nw
// ];

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post(async (req, res) => {
    // piecesは多分盤面においてある全部のpiece
    const pieces = await PlayingModel.find({}, propFilter);
    // playing.test.jsでpostされてきた一つ文のピースの座標
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userID: +req.body.userID,
    };

    // if the piece has already exist, return the original array
    if (pieces.find(p => p.x === result.x && p.y === result.y)) {
      res.json(pieces);
      return;
    }

    // // turn over test
    // const turnCandidate = [];

    // for (let i = 0; i < dirArr.length; i += 1) {
    //   // dirArrから進行方向の成分を取得
    //   const dirX = dirArr[i][0];
    //   const dirY = dirArr[i][1];

    //   let dist = 1;
    //   const searchX = result.x + (dirX * dist);
    //   const searchY = result.y + (dirY * dist);


    //   // picesの中に、result起点でdirArr[i]方向にdist進んだpieceがあるか検索。リターンはobj
    //   const targetPiece = pieces.find(p => p.x === searchX && p.y === searchY);

    //   while (targetPiece !== undefined) {
    //     if (targetPiece.userID !== result.userID) {
    //       turnCandidate.push(targetPiece);
    //       dist += 1;
    //     } else if (targetPiece.userID === result.userID) {
    //       for (let k = 0; k < turnCandidate.length; k += 1) {
    //         turnCandidate[k].userID = result.userID;
    //       }
    //       break;
    //     }
    //   }
    // }

    const Playing = new PlayingModel(result);
    await Playing.save();
    res.json(await PlayingModel.find({}, propFilter));
  });

module.exports = router;
