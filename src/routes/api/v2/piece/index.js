
const router = require('express').Router();
const PieceModel = require('../../../../models/v2/PieceModel.js');

const dirXY = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

const dirAll = [
  ...dirXY,
  [-1, 1],
  [1, 1],
  [1, -1],
  [-1, -1],
];

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post((req, res) => {
    const pieces = PieceModel.getPieces();

    const piece = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };

    if (pieces.find(p => p.x === piece.x && p.y === piece.y)) {
      return res.json(PieceModel.getPieces());
    }

    const flip = [];
    if (pieces.find(p => p.userId === piece.userId)) {
      for (let i = 0; i < dirAll.length; i += 1) {
        const rslt = [];
        const dirX = dirAll[i][0];
        const dirY = dirAll[i][1];
        const aroundX = piece.x + dirX;
        const aroundY = piece.y + dirY;

        let n = 1;
        let dirPiece = PieceModel.seeNext(pieces, aroundX, aroundY);

        if (dirPiece) {
          if (dirPiece.userId !== piece.userId) {
            while (dirPiece) {
              if (dirPiece.userId !== piece.userId) {
                rslt.push(dirPiece);
                n += 1;
                const nextPieceX = piece.x + dirX * n;
                const nextPieceY = piece.y + dirY * n;
                dirPiece = PieceModel.seeNext(pieces, nextPieceX, nextPieceY);
              } else if (dirPiece.userId === piece.userId) {
                pieces.push(piece);
                for (let j = 0; j < rslt.length; j += 1) {
                  if (rslt[j] !== undefined) {
                    rslt[j].userId = piece.userId;
                    flip.push(rslt[j]);
                  }
                }
                break;
              }
            }
          }
        }
      }
    } else if (pieces.length === 0) {
      pieces.push(piece);
    } else {
      for (let i = 0; i < dirXY.length; i += 1) {
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];
        const aroundX = piece.x + dirX;
        const aroundY = piece.y + dirY;
        const dirPiece = pieces.find(p => p.x === aroundX && p.y === aroundY);
        if (dirPiece !== undefined) {
          pieces.push(piece);
          break;
        }
      }
    }
    for (let i = 0; i < pieces.length; i += 1) {
      const p = pieces[i];
      for (let j = 0; j < flip.length; j += 1) {
        const f = flip[j];
        if (f.x === p.x && f.y === p.y) {
          p.userId = f.userId;
        }
      }
    }
    return res.json(PieceModel.getPieces());
  })
  .delete((req, res) => {
    PieceModel.deletePieces();
    res.sendStatus(204);
  });
module.exports = router;
