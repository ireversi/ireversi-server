const router = require('express').Router();

const PieceModel = require('../../../../models/ando/PieceModel.js');

const propFilter = '-_id -__v';

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post(async (req, res) => {
    // バリデーション
    if (Number.isInteger(+req.body.x) && Number.isInteger(+req.body.y)
                && Number.isInteger(+req.body.userId) && +req.body.userId >= 1) {
      /* 初期値設定 */
      const result = {
        x: +req.body.x,
        y: +req.body.y,
        userId: +req.body.userId,
      };

      const piecesCheck = [];
      let putPieceFlg = false;
      let removeFlg = true;

      const ownPieces = await PieceModel.find({ userId: result.userId }, propFilter);

      /* リクエストされた座標を中心とした9マスの状況確認 */
      for (let i = -1; i <= 1; i += 1) {
        for (let j = -1; j <= 1; j += 1) {
          const piece = await PieceModel.find({ x: result.x + i, y: result.y + j });
          if (piece[0]) {
            piecesCheck.push(piece[0].userId);
          } else {
            piecesCheck.push(false);
          }
        }
      }
      // 既に同一座標にコマがないか判定
      if (!piecesCheck[4]) {
        // 隣接する上下左右にコマがあるか判定
        if ((piecesCheck[1] && (piecesCheck[1] !== result.userId))
              || (piecesCheck[3] && (piecesCheck[3] !== result.userId))
              || (piecesCheck[5] && (piecesCheck[5] !== result.userId))
              || (piecesCheck[7] && (piecesCheck[7] !== result.userId))) {
          putPieceFlg = true;
        // 既に自分のコマがあるとき、斜めにコマがあるか判定
        } else if (ownPieces.length > 0
            && ((piecesCheck[0] && (piecesCheck[0] !== result.userId))
                  || (piecesCheck[2] && (piecesCheck[2] !== result.userId))
                  || (piecesCheck[6] && (piecesCheck[6] !== result.userId))
                  || (piecesCheck[8] && (piecesCheck[8] !== result.userId)))) {
          putPieceFlg = true;
        // その盤で1手目の場合は制限なし
        } else if ((await PieceModel.find({})).length === 0) {
          putPieceFlg = true;
        }
      }

      /* めくり判定 */
      if (putPieceFlg && ownPieces.length > 0) {
        for (let i = 0; i < ownPieces.length; i += 1) {
          let turnFlg = false;
          // Y軸方向
          if (ownPieces[i].x === result.x) {
            let sign = 1;
            // リクエストされたコマから既存のコマに向かって確認
            for (let j = 1; j < Math.abs(ownPieces[i].y - result.y); j += 1) {
              // 置いたコマ方のがY方向に大きい
              if (ownPieces[i].y < result.y) sign = -1;
              // コマを取得
              const targetPiece = await PieceModel.find({ x: result.x, y: result.y + sign * j },
                propFilter);
              // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
              if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                turnFlg = false;
                break;
              } else {
                turnFlg = true;
              }
            }
            // めくり処理
            if (turnFlg) {
              for (let j = 1; j < Math.abs(ownPieces[i].y - result.y); j += 1) {
                await PieceModel.update(
                  { x: result.x, y: result.y + sign * j },
                  { $set: { userId: result.userId } },
                );
              }
              removeFlg = false;
            }

          // X軸方向
          } else if (ownPieces[i].y === result.y) {
            let sign = 1;
            // リクエストされたコマから既存のコマに向かって確認
            for (let j = 1; j < Math.abs(ownPieces[i].x - result.x); j += 1) {
              // 置いたコマ方のがX方向に大きい
              if (ownPieces[i].x < result.x) sign = -1;
              // コマを取得
              const targetPiece = await PieceModel.find({ x: result.x + sign * j, y: result.y },
                propFilter);
              // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
              if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                turnFlg = false;
                break;
              } else {
                turnFlg = true;
              }
            }
            // めくり処理
            if (turnFlg) {
              for (let j = 1; j < Math.abs(ownPieces[i].x - result.x); j += 1) {
                await PieceModel.update(
                  { x: result.x + sign * j, y: result.y },
                  { $set: { userId: result.userId } },
                );
              }
              removeFlg = false;
            }

          // 斜め方向
          } else if (Math.abs((result.y - ownPieces[i].y) / (result.x - ownPieces[i].x)) === 1) {
            // 象限により符号反転
            let signX = 1;
            let signY = 1;
            if (ownPieces[i].x < result.x) signX = -1;
            if (ownPieces[i].y < result.y) signY = -1;
            // リクエストされたコマから既存のコマに向かって確認
            for (let j = 1; j < Math.abs(ownPieces[i].x - result.x); j += 1) {
              // コマを取得
              const targetPiece = await PieceModel.find({
                x: result.x + signX * j,
                y: result.y + signY * j,
              }, propFilter);
              // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
              if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                turnFlg = false;
                break;
              } else {
                turnFlg = true;
              }
            }
            // めくり処理
            if (turnFlg) {
              for (let j = 1; j < Math.abs(ownPieces[i].x - result.x); j += 1) {
                await PieceModel.update({ x: result.x + signX * j, y: result.y + signY * j },
                  { $set: { userId: result.userId } });
              }
              removeFlg = false;
            }
          }
        }
        // めくれなかった場合
        if (removeFlg) {
          putPieceFlg = false;
        }
      }

      /*  登録処理 */
      if (putPieceFlg) {
        const Piece = new PieceModel(result);
        await Piece.save();
      }
    }

    /* 送信処理 */
    const allPieces = await PieceModel.find({}, propFilter);
    res.json(allPieces);
  })
  .delete(async (req, res) => {
    // 全削除
    if (req.body.keyword === 'deleteAll') {
      await PieceModel.remove();
    // 選択削除
    } else if (Number.isInteger(+req.body.x) && Number.isInteger(+req.body.y)
                && Number.isInteger(+req.body.userId) && +req.body.userId >= 1) {
      const result = {
        x: +req.body.x,
        y: +req.body.y,
        userId: +req.body.userId,
      };
      await PieceModel.remove({ x: result.x, y: result.y, userId: result.userId });
    }
    res.json(await PieceModel.find({}, propFilter));
  });

module.exports = router;
