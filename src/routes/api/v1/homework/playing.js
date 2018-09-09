const router = require('express').Router();

const PlayingModel = require('../../../../models/homework/PlayingModel.js');

const propfilter = '-_id -__v';

function checkTurnOver(result, data) {
  const arry = [];
  for (let dx = -1; dx <= 1; dx += 1) { // x座標の左右範囲
    for (let dy = -1; dy <= 1; dy += 1) { // y座標の上下範囲
      let nx = result.x + dx; // 確認するy座標
      let ny = result.y + dy; // 確認するy座標
      const copyData = [...data]; // 参照渡し防止
      /* eslint-disable-next-line no-loop-func */
      const target = copyData.find(el => el.x === nx && el.y === ny && el.userId !== result.userId);
      // if (dx === 0 && dy === 0) { // 中央（自身）はスキップ
      //   continue;
      // }
      if (target) {
        nx += dx;
        ny += dy;
        /* eslint-disable-next-line no-loop-func */
        const mine = data.find(el => el.x === nx && el.y === ny && el.userId === result.userId);
        if (mine) {
          const flipped = JSON.parse(JSON.stringify(target)); // 参照渡し防止
          flipped.userId = result.userId;
          arry.push([target, flipped]);
          // console.log(result,flipped, mine, "test");
        }
      }
    }
  }
  return arry;
}

router.route('/')

  .post(async (req, res) => {
    const data = await PlayingModel.find({}, propfilter);
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };

    // めくる処理

    const flipArry = checkTurnOver(result, data);
    for (let i = 0; i < flipArry.length; i += 1) {
      if (flipArry.length !== 0) {
        // console.log(flipArry[0], "function");
        const add = {// 追加する対象の指定
          x: flipArry[i][1].x,
          y: flipArry[i][1].y,
          userId: flipArry[i][1].userId,
        };
        const remove = {// 削除する対象の指定
          x: flipArry[i][0].x,
          y: flipArry[i][0].y,
          userId: flipArry[i][0].userId,
        };
        await PlayingModel.remove(remove);
        await new PlayingModel(add).save(); // 今置いたピースのコピー
      }
    }

    if (data.find(el => el.x === result.x && el.y === result.y)) {
      res.json(await PlayingModel.find({}, propfilter)); // 全体のデータを取ってくる
    } else {
      const Piece = new PlayingModel(result); // 今置いたピースのコピー
      await Piece.save();
      res.json(await PlayingModel.find({}, propfilter)); // 全体のデータを取ってくる
    }
  });

module.exports = router;
