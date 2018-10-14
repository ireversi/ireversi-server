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

router.route('/')
  .post((req, res) => {
    const pieces = PieceStore.getPieces();
    const piece = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.query.userId,
    };

    let status;

    // ８方向に当たる値をコピー格納する配列
    const elected = [];
    for (let i = 0, e = pieces.length; i < e; i += 1) {
      const elPiece = pieces[i];
      const vectorX = Math.abs(elPiece.x - piece.x);
      const vectorY = Math.abs(elPiece.y - piece.y);
      if (elPiece.x === piece.x && elPiece.y === piece.y) { // 同じところ
        status = false;
        res.json({ status, piece });
        // return;
      } else if (elPiece.x === piece.x || elPiece.y === piece.y) { // elPieceが送った値の縦横にある場合
        elected.push(elPiece);
      } else if (vectorX === vectorY) {
        elected.push(elPiece);
      }
    }

    const flip = [];
    // 盤面に自コマがある場合
    if (elected.find(p => p.userId === piece.userId)) {
      let around = 0; // 周回した回数。最大8回。
      for (let i = 0; i < dirAll.length; i += 1) {
        const rslt = []; // 通って来たコマを一時保存する。めくれる条件のときはflipに移す。
        const dirX = dirAll[i][0];
        const dirY = dirAll[i][1];
        const aroundX = piece.x + dirX;
        const aroundY = piece.y + dirY;

        let n = 1;
        let dirPiece = PieceStore.seeNext(elected, aroundX, aroundY);

        if (dirPiece) {
          if (dirPiece.userId !== piece.userId) {
            while (dirPiece) {
              if (dirPiece.userId !== piece.userId) {
                rslt.push(dirPiece);
                n += 1;
                const nextPieceX = piece.x + dirX * n;
                const nextPieceY = piece.y + dirY * n;
                dirPiece = PieceStore.seeNext(elected, nextPieceX, nextPieceY);
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
        } else {
          around += 1;
          if (around === 8) {
            status = false;
          }
        }
      }
    // 他コマばかりで自コマがない場合、
    } else {
      // 上下左右を検索
      for (let i = 0; i < dirXY.length; i += 1) {
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];
        const aroundX = piece.x + dirX;
        const aroundY = piece.y + dirY;
        const dirPiece = elected.find(p => p.x === aroundX && p.y === aroundY);
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

    // コマを置いたときに一緒にサイズを確認し、送る
    if (status) {
      const valueX = pieces.map(m => m.x);
      const valueY = pieces.map(m => m.y);

      const xMin = Math.min(...valueX);
      const xMax = Math.max(...valueX);
      const yMin = Math.min(...valueY);
      const yMax = Math.max(...valueY);
      PieceStore.addSize({
        xMin,
        xMax,
        yMin,
        yMax,
      });
    }
    res.json({ status, piece });
  })
  .delete((req, res) => {
    const pieces = PieceStore.deletePieces();
    res.json(pieces);
  });
module.exports = router;
