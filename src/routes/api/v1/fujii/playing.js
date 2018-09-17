const router = require('express').Router();

const PlayingModel = require('../../../../models/fujii/PlayingModel.js');

const propfilter = '-_id -__v';

const adjacentPieces = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
];

const adjacents = [
  ...adjacentPieces, [1, 1], [1, -1], [-1, -1], [-1, 1],
];

// CORSを許可する
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

router.route('/')
  // 削除処理
  .delete(async (req, res) => {
    // リセット
    if (req.body.keyword === 'deleteAll') {
      await PlayingModel.remove();
      res.json(await PlayingModel.find({}, propfilter));
    // １コマ削除
    } else if (req.body.keyword === 'deleteOne') {
      const result = {
        x: +req.body.x,
        y: +req.body.y,
        userId: +req.body.userId,
      };
      await PlayingModel.remove({ x: result.x, y: result.y, userId: result.userId });
      res.json(await PlayingModel.find({}, propfilter));
    } else {
      res.json(await PlayingModel.find({}, propfilter));
    }
  })
  // データ登録処理
  .post(async (req, res) => {
    const data = await PlayingModel.find({}, propfilter);
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };

    // 既にその座標に駒がある場合、元の盤面を返す
    if (data.find(el => el.x === result.x && el.y === result.y)) {
      res.json(data);
      return;
    }

    const updatePieces = []; // めくるための空の配列

    for (let i = 0; i < adjacents.length; i += 1) {
      const adj = adjacents[i]; // 短い変数へ入れる
      const candidates = []; // めくる可能性のある駒を入れるための空配列
      let target = data.find(el => el.x === result.x + adj[0] && el.y === result.y + adj[1]);
      let flag = false; // falseで立てておき、同じuserIdが見つかればtrueに切り替えて止める
      let n = 1;

      // 周りが存在する限り
      while (target) {
        if (target.userId === result.userId) {
          flag = true;
          break;
        } else {
          // めくる可能性のある駒をcandidatesに送る
          candidates.push(target);
          // targetの更新(nをかけることで一つ先の方向に進む)
          n += 1;
          /* eslint-disable-next-line no-loop-func */
          target = data.find(e => e.x === result.x + adj[0] * n && e.y === result.y + adj[1] * n);
        }
      }

      // whileループを回した後に同じidのものが見つかっていれば、
      if (flag) {
        updatePieces.push(...candidates);
      }
    }

    // 自分の駒がない場合の処理
    if (!data.find(el => el.userId === result.userId)) {
      let existBy = false;
      // 上下左右を確認
      for (let i = 0; i < 4; i += 1) {
        const adj = adjacentPieces[i];
        // 自分の駒がなければ
        if (data.find(el => el.x === result.x + adj[0] && el.y === result.y + adj[1])) {
          existBy = true;
          break;
        }
      }

      // 上下左右に存在しない場合、置けない
      if (data.length > 0 && !existBy) {
        res.json(data);
        return;
      }
    }

    // 自分の駒があるが、めくれない場所に置いた場合
    if (data.find(el => el.userId === result.userId)) {
      if (updatePieces.length === 0) {
        res.json(data);
        return;
      }
    }

    await Promise.all([ // 一度に更新する
      // 今置いた駒の更新
      new PlayingModel(result).save(),
      // めくる更新処理
      ...updatePieces.map(el => PlayingModel.updateOne(
        { x: el.x, y: el.y },
        { userId: result.userId },
      )),
    ]);

    res.json(await PlayingModel.find({}, propfilter)); // 全体のデータを返す
  });

module.exports = router;
