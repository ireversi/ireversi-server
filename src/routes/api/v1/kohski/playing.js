const router = require('express').Router();
const PlayingModel = require('../../../../models/kohski/PlayingModel.js');

const propFilter = '-_id -__v';

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const dirAll = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
];

function searchNext(pieces, nextX, nextY) {
  return pieces.find(p => p.x === nextX && p.y === nextY);
}

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

    // ----------------------------------------------
    // 挟んだらめくれるテスト
    const flip = [];

    if (pieces.find(p => p.userID === result.userID)) {
      for (let i = 0; i < dirAll.length; i += 1) {
        const turnCandidate = [];

        const dirX = dirAll[i][0];
        const dirY = dirAll[i][1];
        const toX = result.x + dirX;
        const toY = result.y + dirY;

        let dist = 1;
        let dirPiece = pieces.find(p => p.x === toX && p.y === toY);

        while (dirPiece !== undefined) {
          if (dirPiece.userID !== result.userID) {
            turnCandidate.push(dirPiece);
            dist += 1;

            const nextX = result.x + dirX * dist;
            const nextY = result.y + dirY * dist;

            dirPiece = searchNext(pieces, nextX, nextY);
          } else if (dirPiece.userID === result.userID) {
            for (let k = 0; k < turnCandidate.length; k += 1) {
              if (turnCandidate[k] !== undefined) {
                turnCandidate[k].userID = result.userID;
                flip.push(turnCandidate[k]);
              }
            }
            break;
          }
        }
      }
    }

    const Playing = new PlayingModel(result);
    await Playing.save();
    await Promise.all(flip.map(p => PlayingModel.updateOne(
      { x: p.x, y: p.y }, // 第一引数がfilter
      { userID: p.userID }, // 第二引数でupdate
    )));
    res.json(await PlayingModel.find({}, propFilter));
  });
module.exports = router;
