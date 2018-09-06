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
    const Put = new PlayingModel({ // 今まさにPutしたやつ
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    });

    // 同じところに置けない
    if (pieces.find(p => p.x === Put.x && p.y === Put.y)) {
      res.json(Put); // そっくりそのままお返しします
      return;
    }

    // 挟んだらめくれる
    const flipList = [];
    for (let i = 0; i < 8; i += 1) {
      const aroundX = Put.x + dir[i][0]; // 向かいたい方向のxの値
      const aroundY = Put.y + dir[i][1]; // 向かいたい方向のyの値
      // 向かいたい方向の１つ目をpiecesから取得
      let direction = pieces.find(p => p.x === aroundX && p.y === aroundY);

      // 向かいたい方向の１つめに自分以外のidがある場合
      if (direction !== undefined && direction.userId !== Put.userId) {
        // 向かいたい方向の候補
        let flipDir = { x: aroundX, y: aroundY, userId: direction.userId };
        flipList.push(flipDir);

        // 2つめ以降を見に行く
        while (direction !== undefined) {
          const dirX = aroundX + dir[i][0]; // 向かう方向のxの値
          const dirY = aroundY + dir[i][1]; // 向かう方向のyの値

          direction = pieces.find(p => p.x === dirX && p.y === dirY); // 向かう方向のコマの値をpiecesから取得
          if (direction === undefined) {
            flipList.pop();
            // continue;
          }

          if (direction !== undefined) { // 向かう方向の2つめ以降に自IDがある場合(userIdが0じゃない場合)
            flipDir = { x: dirX, y: dirY, userId: direction.userId };
            flipList.push(flipDir);
          }
          flipList.map((n) => {
            const tmp = n;
            tmp.userId = Put.userId;
            return tmp;
          });
          break;
        }
      }
    }
    const Piece = new PlayingModel(Put); // 今置いたピースのコピー
    await Piece.save();
    res.json(await PlayingModel.find({}, propFilter)); // 全体のデータを取ってくる
  });

module.exports = router;
