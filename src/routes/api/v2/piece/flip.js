const router = require('express').Router();

const dirXY = [
  [0, 1], // 北
  [1, 0], // 東
  [0, -1], // 南
  [-1, 0], // 西
];

const dirAll = [
  ...dirXY,
  [-1, 1], // 北西
  [1, 1], // 北東z
  [1, -1], // 南東
  [-1, -1], // 南西
];

const array2Premise = (field) => {
  const array = [];
  const sqrt = Math.sqrt(field.length);
  for (let i = 0; i < field.length; i += 1) {
    if (field[i] !== 0) {
      const x = i % sqrt;
      const y = Math.floor(((field.length - 1) - i) / sqrt);
      const userId = field[i];
      array.push({ x, y, userId });
    }
  }
  return array;
};

const premiseArray = array2Premise(
  [
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 1, 2, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
  ],
);

// 先のコマを確認する関数
function seeNext(pieces, nextPieceX, nextPieceY) {
  return pieces.find(p => p.x === nextPieceX && p.y === nextPieceY);
}

// route('/') はルーティングがここまでですよの書き方
// データベースの処理は基本非同期なので、同期させる
router.route('/')
// res.jsonでresponse.bodyに返す
  .post(async (req, res) => {
    console.log('⚫ たよ');

    const Playing = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };
    console.log(Playing);
    console.log(premiseArray);

    const pieces = [];

    // 同じところに置けない
    if (pieces.find(p => p.x === Playing.x && p.y === Playing.y)) {
      res.json(pieces); // そっくりそのままお返しします
      return;
    }

    /* ----------------------------------------------------------- */
    // 挟んだらめくれる
    // フィールドに自コマがある場合、めくれる場所にしか置けない
    const flip = [];

    // フィールドに自コマがあるとき
    if (pieces.find(p => p.userId === Playing.userId)) {
      for (let i = 0; i < dirAll.length; i += 1) {
        const rslt = []; // めくる候補リスト

        const dirX = dirAll[i][0];
        const dirY = dirAll[i][1];
        const aroundX = Playing.x + dirX; // 向かいたい方向のxの値
        const aroundY = Playing.y + dirY; // 向かいたい方向のyの値

        let n = 1; // 向かう方向の距離
        let dirPiece = pieces.find(p => p.x === aroundX && p.y === aroundY); // 向かう先にあるコマ

        while (dirPiece !== undefined) { // 向かい先に何かコマがある限り
          if (dirPiece.userId !== Playing.userId) { // 向かう先が他コマの場合
            rslt.push(dirPiece); // めくる候補にいれる
            n += 1;
            // もう１つ先を見る
            const nextPieceX = Playing.x + dirX * n;
            const nextPieceY = Playing.y + dirY * n;
            dirPiece = seeNext(pieces, nextPieceX, nextPieceY);
          } else if (dirPiece.userId === Playing.userId) { // 先に自コマがあるとき
            console.log(Playing);

            await Playing.save();
            for (let j = 0; j < rslt.length; j += 1) {
              if (rslt[j] !== undefined) {
                rslt[j].userId = Playing.userId; // 置いたコマと同じIdに変更
                flip.push(rslt[j]);
              }
            }
            break; // whileを抜ける
          }
        }
      }
      // // めくれるコマがないときは、置けない処理
      // if (flip.length === 0) {
      //   await PlayingModel.remove({ x: Playing.x, y: Playing.y });
      // }
      // 注意：フィールドに何もないときは置ける（１個目）
      // } else if (pieces.length === 0) {
      //   await new PlayingModel(Playing).save(); // 置いてよし

    // フィールドに自コマがないとき、他コマの上下左右にしか置けない処理
    } else {
      for (let i = 0; i < dirXY.length; i += 1) {
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];
        const aroundX = Playing.x + dirX; // 調べたい方向のxの値
        const aroundY = Playing.y + dirY; // 調べたい方向のyの値
        const dirPiece = pieces.find(p => p.x === aroundX && p.y === aroundY);
        console.log(dirPiece);

        // 誰かのコマがあるか
        // if (dirPiece !== undefined) {
        //   await new PlayingModel(Playing).save(); // 置いてよし
        // }
      }
    }

    // await Promise.all(flip.map(p => PlayingModel.updateOne(
    //   { x: p.x, y: p.y },
    //   { userId: p.userId },
    // )));
    res.json(await pieces.find({})); // 全体のデータを送る
  });
module.exports = router;
