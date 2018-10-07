const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');

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
    const pieces = PieceStore.getPieces();
    const piece = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.query.userId,
    };
    let status;

    // マスに他コマがある場合
    for (let i = 0; i < pieces.length; i += 1) {
      const p = pieces[i];
      if (p.x === piece.x && p.y === piece.y) {
        status = false;
        res.json({ status, piece }); // 他コマがある場合はfalseつけて戻す
        return;
      }
      if (p.x !== piece.x && p.y !== piece.y) {
        status = true;
      }
    }

    const flip = [];
    // 盤面に自コマがある場合
    if (pieces.find(p => p.userId === piece.userId)) {
      for (let i = 0; i < dirAll.length; i += 1) {
        const rslt = []; // 通って来たコマを一時保存する。めくれる条件のときはflipに移す。
        const dirX = dirAll[i][0];
        const dirY = dirAll[i][1];
        const aroundX = piece.x + dirX;
        const aroundY = piece.y + dirY;

        let n = 1;
        let dirPiece = PieceStore.seeNext(pieces, aroundX, aroundY);

        if (dirPiece) {
          if (dirPiece.userId !== piece.userId) {
            while (dirPiece) {
              if (dirPiece.userId !== piece.userId) {
                rslt.push(dirPiece);
                n += 1;
                const nextPieceX = piece.x + dirX * n;
                const nextPieceY = piece.y + dirY * n;
                dirPiece = PieceStore.seeNext(pieces, nextPieceX, nextPieceY);
              } else if (dirPiece.userId === piece.userId) {
                PieceStore.addPiece(piece);
                status = true;
                for (let j = 0; j < rslt.length; j += 1) {
                  if (rslt[j] !== undefined) {
                    rslt[j].userId = piece.userId;
                    flip.push(rslt[j]);
                  }
                }
                break;
              }
            }
          } else {
            status = false;
          }
        }
      }
    // 盤面にコマがひとつもない場合
    } else if (pieces.length === 0) {
      status = true;
      PieceStore.addPiece(piece);
    // 他コマばかりで自コマがない場合、
    } else {
      // 上下左右を検索
      for (let i = 0; i < dirXY.length; i += 1) {
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];
        const aroundX = piece.x + dirX;
        const aroundY = piece.y + dirY;
        const dirPiece = pieces.find(p => p.x === aroundX && p.y === aroundY);
        if (dirPiece !== undefined) { // 上下左右いずれかのとなりに他コマがある場合
          status = true;
          PieceStore.addPiece(piece);
          break;
        } else {
          status = false;
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
    res.json({ status, piece });
  })
  .delete((req, res) => {
    PieceStore.deletePieces();
    res.sendStatus(204);
  });
module.exports = router;
