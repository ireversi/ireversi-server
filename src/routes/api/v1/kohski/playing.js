const router = require('express').Router();
const PlayingModel = require('../../../../models/kohski/PlayingModel.js');

const propFilter = '-_id -__v';

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
const dirXY = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

const dirAll = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
];

function searchNext(pieces, nextX, nextY) {
  return pieces.find(p => p.x === nextX && p.y === nextY);
}

router.route('/')
  .post(async (req, res) => {
    // piecesは多分盤面においてある全部のpiece
    const pieces = (await PlayingModel.find({}, propFilter));
    // playing.test.jsでpostされてきた一つ文のピースの座標
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };
    // console.log("----------------------------");
    // console.log("pieces:"+pieces);
    // console.log(result);

    // if the piece has already exist, return the original array
    if (pieces.find(p => p.x === result.x && p.y === result.y)) {
      res.json(pieces);
      return;
    }

    // ----------------------------------------------
    // 挟んだらめくれるテスト
    const flip = [];

    // piecesの中を探索してtestから送られてきたresultと同一のものを探索
    if (pieces.find(p => p.userId === result.userId)) {
      // console.log("piecese = p.userId === result.userId");
      for (let i = 0; i < dirAll.length; i += 1) {
        // めくる候補のリスト
        const turnCandidate = [];

        // 探索する方向をdirAllから取得
        const dirX = dirAll[i][0];
        const dirY = dirAll[i][1];

        // resultからひとます分dir方向へ進む
        const toX = result.x + dirX;
        const toY = result.y + dirY;

        // 探索方向の距離をセット
        let dist = 1;

        // piecesの中から現在探索中のセルを取得
        let dirPiece = pieces.find(p => p.x === toX && p.y === toY);
        // console.log(dirPiece);
        // dirPieceが尽きるまで試行
        while (dirPiece !== undefined) {
          // 探索セルがresultと違うIDなら
          if (dirPiece.userId !== result.userId) {
            // console.log("dirPiece.userId === result.userId");
            turnCandidate.push(dirPiece);
            dist += 1;

            // 探索方向へひとます進んだx,y要素を渡す
            const nextX = result.x + dirX * dist;
            const nextY = result.y + dirY * dist;

            // ひとます進める
            dirPiece = searchNext(pieces, nextX, nextY);
          } else if (dirPiece.userId === result.userId) { // userIdが同じものが見つかったら
            // await new PlayingModel(result).save();
            // それまでに溜まったturnCandidateを探索

            for (let k = 0; k < turnCandidate.length; k += 1) {
              // turnCandidateをひっくり返す処理
              if (turnCandidate[k] !== undefined) {
                turnCandidate[k].userId = result.userId;
                flip.push(turnCandidate[k]);
              }
            }
            await new PlayingModel(result).save();
            break;
          }
        }
      }
      if (flip.length === 0) {
        // console.log("flipなしなのでremove")
        await PlayingModel.remove({ x: result.x, y: result.y });
      }
    } else if (pieces.length === 0) {
      // console.log("pieces.length=0");
      await new PlayingModel(result).save();
    } else {
      // console.log("pieces.length !==0 かつ userId一致なし");
      for (let i = 0; i < dirXY.length; i += 1) {
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];

        const toX = result.x + dirX;
        const toY = result.y + dirY;
        const dirPiece = pieces.find(p => p.x === toX && p.y === toY);

        if (dirPiece !== undefined) {
          // console.log("length=0&&userId unique register");
          await new PlayingModel(result).save();
          break;
        }
      }
    }
    // console.log("最後");
    // const Playing = new PlayingModel(result);
    // await Playing.save();
    // flipをmapでバラしてそれぞれの要素で第一引数でfilterかけてuserIdをupdate
    await Promise.all(flip.map(p => PlayingModel.updateOne(
      { x: p.x, y: p.y }, // 第一引数がfilter
      { userId: p.userId }, // 第二引数でupdate
    )));
    res.json(await PlayingModel.find({}, propFilter));
  });
module.exports = router;
