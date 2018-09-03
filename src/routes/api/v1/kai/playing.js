const router = require('express').Router();

const PlayingModel = require('../../../../models/kai/PlayingModel.js');

const propFilter = '-_id -__v';

// var set = new Set();
// let dir = [
//   [-1, 1],
//   [0, 1],
//   [1, 1],
//   [1, 0],
//   [1, -1],
//   [0, -1],
//   [-1, -1],
//   [-1, 0]
// ];

// route('/') はルーティングがここまでですよの書き方
// データベースの処理は基本非同期なので、同期させる
router.route('/')
// res.jsonでresponse.bodyに返す
  .post(async (req, res) => {
    const pieces = (await PlayingModel.find({}, propFilter)); // 今存在するpiece
    const Playing = new PlayingModel({ // 今置いたpiece
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    });
    // 同じところに置けない
    if (pieces.find(p => p.x === Playing.x && p.y === Playing.y)) {
      res.json(Playing);
      return;
    }

    // 挟んだらめくれる
    // for (let i = 0; i < dir.length; i++) {
    //   if (pieces.find(p => p.x === Playing.x+dir[i][0] && p.y === Playing.y+dir[i][1])) {
    //     console.log(Playing.x, Playing.y, Playing.userId);
    //   }
    // }


    const Piece = new PlayingModel(Playing); // 今置いたピースのコピー
    await Piece.save();
    res.json(await PlayingModel.find({}, propFilter)); // 全体のデータを取ってくる
  });

module.exports = router;
