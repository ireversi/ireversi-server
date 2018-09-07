const router = require('express').Router();

const PlayingModel = require('../../../../models/kai/PlayingModel.js');

const propFilter = '-_id -__v';

// var set = new Set();
const dir = [
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
];


// route('/') はルーティングがここまでですよの書き方
// データベースの処理は基本非同期なので、同期させる
router.route('/')
// res.jsonでresponse.bodyに返す
  .post(async (req, res) => {
    const pieces = (await PlayingModel.find({}, propFilter)); // 今存在するpiece

    const Playing = new PlayingModel({
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    });
    await Playing.save();

    // 同じところに置けない
    if (pieces.find(p => p.x === Playing.x && p.y === Playing.y)) {
      res.json(pieces); // そっくりそのままお返しします
      return;
    }
    // 挟んだらめくれる処理
    for (let i = 0; i < 8; i += 1) {
      const aroundX = Playing.x + dir[i][0]; // 向かいたい方向のxの値
      const aroundY = Playing.y + dir[i][1]; // 向かいたい方向のyの値
      // 向かいたい方向の１つ目をpiecesから取得
      let dirPiece = pieces.find(p => p.x === aroundX && p.y === aroundY);
      let rslt = []; // 結果に入れる候補
      // 向かいたい方向の１つめに自分以外のidがある場合
      if (dirPiece !== undefined && dirPiece.userId !== Playing.userId) {
        rslt.push(dirPiece);
        // 2つめ以降を見に行く
        while (dirPiece !== undefined) {
          const dirX = aroundX + dir[i][0]; // 向かう方向のxの値
          const dirY = aroundY + dir[i][1]; // 向かう方向のyの値
          // 向かう方向のコマの値をpiecesから取得
          dirPiece = pieces.find(p => p.x === dirX && p.y === dirY);

          if (dirPiece === undefined) { // 向かう方向の先に自コマがないとき
            rslt = [];
            break;
          }

          if (dirPiece !== undefined) { // 向かう方向の2つめ以降に自IDがある場合(userIdが0じゃない場合)
            rslt.push(dirPiece);
          }
          for (let j = 0; j < rslt.length; j += 1) {
            rslt[j].userId = Playing.userId;
            await PlayingModel.remove({ x: rslt[j].x, y: rslt[j].y });
            const Play = new PlayingModel({
              x: rslt[j].x,
              y: rslt[j].y,
              userId: Playing.userId,
            });
            await Play.save();
          }
          break;
        }
        break;
      }
    }
    await Promise.all(pieces.map(p => PlayingModel.update(
      { _id: p.id },
      { _userId: p.userId },
    )));
    res.json(await PlayingModel.find({}, propFilter)); // 全体のデータを取ってくる
  });

module.exports = router;
