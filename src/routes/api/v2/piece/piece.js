const router = require('express').Router();
const pieceCrtl = require('../../../../models/v2/PieceModel.js');

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

// 先のコマを確認する関数
function seeNext(piece, nextPieceX, nextPieceY) {
  return piece.find(p => p.x === nextPieceX && p.y === nextPieceY);
}

router.route('/')
// res.jsonでresponse.bodyに返す
  .post(async (req, res) => {
    const pi = pieceCrtl.getPieces();
    const array = pi.pieces;
    console.log(array);

    const playing = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };
    console.log(playing);

    // 同じところに置けない
    if (array.find(p => p.x === playing.x && p.y === playing.y)) {
      res.json(array); // そっくりそのままお返しします
      return;
    }

    const flip = []; // めくる候補
    // フィールドに自コマがあるとき
    if (array.find(p => p.userId === playing.userId)) {
      for (let i = 0; i < dirAll.length; i += 1) {
        const rslt = []; // めくる候補リスト

        const dirX = dirAll[i][0];
        const dirY = dirAll[i][1];
        const aroundX = playing.x + dirX; // 向かいたい方向のxの値
        const aroundY = playing.y + dirY; // 向かいたい方向のyの値

        let n = 1; // 向かう方向の距離
        let dirPiece = array.find(p => p.x === aroundX && p.y === aroundY); // 向かう先にあるコマ

        while (dirPiece !== undefined) { // 向かい先に何かコマがある限り
          if (dirPiece.userId !== playing.userId) { // 向かう先が他コマの場合
            rslt.push(dirPiece); // めくる候補にいれる
            n += 1;
            // もう１つ先を見る
            const nextPieceX = playing.x + dirX * n;
            const nextPieceY = playing.y + dirY * n;
            dirPiece = seeNext(array, nextPieceX, nextPieceY);
          } else if (dirPiece.userId === playing.userId) { // 先に自コマがあるとき
            await array.push(playing);
            for (let j = 0; j < rslt.length; j += 1) {
              if (rslt[j] !== undefined) {
                rslt[j].userId = playing.userId; // 置いたコマと同じIdに変更
                flip.push(rslt[j]);
              }
            }
            break;
          }
        }
      }
      // めくれるコマがないときは、置けない処理
      if (flip.length === 0) {
        await res.json(array);
      }
    // 注意：フィールドに何もないときは置ける（１個目）
    } else if (array.length === 0) {
      await array.push(playing); // 置いてよし

    // フィールドに自コマがないとき、他コマの上下左右にしか置けない処理
    } else {
      for (let i = 0; i < dirXY.length; i += 1) {
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];
        const aroundX = playing.x + dirX; // 調べたい方向のxの値
        const aroundY = playing.y + dirY; // 調べたい方向のyの値
        const dirPiece = array.find(p => p.x === aroundX && p.y === aroundY);

        // 誰かのコマがあるか
        if (dirPiece !== undefined) {
          await array.push(playing); // 置いてよし
        }
      }
    }
    res.json(await array); // 全体のデータを送る
  });
module.exports = router;
