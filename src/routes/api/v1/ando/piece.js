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
      const result = {
        x: +req.body.x,
        y: +req.body.y,
        userId: +req.body.userId,
      };
      // console.log(result);

      const piecesCheck = [];
      let putPieceFlg = false;
      let removeFlg = true;

      // 置こうとしている場所を中心とした9マスの状況確認
      for (let i = -1; i <= 1; i += 1) {
        for (let j = -1; j <= 1; j += 1) {
          if ((await PieceModel.find({ x: result.x + i, y: result.y + j })).length) {
            piecesCheck.push(true);
          } else {
            piecesCheck.push(false);
          }
        }
      }
      // console.log(piecesCheck);

      // 自分のコマを抽出
      const ownPieces = await PieceModel.find({ userId: result.userId }, propFilter);

      // 同じ場所には置けない
      if (!piecesCheck[4]) {
        // 上下左右にコマがあれば置ける
        if (piecesCheck[1] || piecesCheck[3] || piecesCheck[5] || piecesCheck[7]) {
          putPieceFlg = true;
          // console.log('上下左右');
        // ユーザーが2手目以降であったら斜めにコマがあれば置ける
        } else if (ownPieces.length >= 1
            && (piecesCheck[0] || piecesCheck[2] || piecesCheck[6] || piecesCheck[8])) {
          putPieceFlg = true;
          // console.log('斜め');
        // その盤の1手目だったら、どこでも置ける
        } else if ((await PieceModel.find({})).length === 0) {
          putPieceFlg = true;
        }
      }

      // console.log(ownPieces);
      if (ownPieces) {
        for (let i = 0; i < ownPieces.length; i += 1) {
          let flg = true;

          // Y軸方向
          if (ownPieces[i].x === result.x) {
            // 置いたコマ方のがY方向に大きい
            if (ownPieces[i].y < result.y) {
              // 置いたコマの下から次のコマまで
              for (let j = result.y - 1; j > ownPieces[i].y; j -= 1) {
                // コマを取得
                const targetPiece = await PieceModel.find({ x: result.x, y: j }, propFilter);

                // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
                if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                  flg = false;
                  break;
                }
              }

              // めくる処理
              if (flg) {
                for (let j = result.y - 1; j > ownPieces[i].y; j -= 1) {
                  await PieceModel.update(
                    { x: result.x, y: j },
                    { $set: { userId: result.userId } },
                  );
                }
                removeFlg = false;
              }
            // 置いたコマの方がY方向に小さい
            } else if (ownPieces[i].y > result.y) {
              // 置いたコマの下から次のコマまで
              for (let j = result.y + 1; j < ownPieces[i].y; j += 1) {
                // コマを取得
                const targetPiece = await PieceModel.find({ x: result.x, y: j }, propFilter);

                // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
                if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                  flg = false;
                  break;
                }
              }

              // めくる処理
              if (flg) {
                for (let j = result.y + 1; j < ownPieces[i].y; j += 1) {
                  await PieceModel.update(
                    { x: result.x, y: j },
                    { $set: { userId: result.userId } },
                  );
                }
                removeFlg = false;
              }
            }

          // X軸方向
          } else if (ownPieces[i].y === result.y) {
            // 置いたコマ方のがX方向に大きい
            if (ownPieces[i].x < result.x) {
              // 置いたコマの下から次のコマまで
              for (let j = result.x - 1; j > ownPieces[i].x; j -= 1) {
                // コマを取得
                const targetPiece = await PieceModel.find({ x: j, y: result.y }, propFilter);

                // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
                if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                  flg = false;
                  break;
                }
              }

              // めくる処理
              if (flg) {
                for (let j = result.x - 1; j > ownPieces[i].x; j -= 1) {
                  await PieceModel.update(
                    { x: j, y: result.y },
                    { $set: { userId: result.userId } },
                  );
                }
                removeFlg = false;
              }
            // 置いたコマ方のがX方向に小さい
            } else if (ownPieces[i].x > result.x) {
              // 置いたコマの下から次のコマまで
              for (let j = result.x + 1; j < ownPieces[i].x; j += 1) {
                // コマを取得
                const targetPiece = await PieceModel.find({ x: j, y: result.y }, propFilter);

                // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
                if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                  flg = false;
                  break;
                }
              }

              // めくる処理
              if (flg) {
                for (let j = result.x + 1; j < ownPieces[i].x; j += 1) {
                  await PieceModel.update(
                    { x: j, y: result.y },
                    { $set: { userId: result.userId } },
                  );
                }
                removeFlg = false;
              }
            }

          // 斜め方向
          } else if (Math.abs((result.y - ownPieces[i].y) / (result.x - ownPieces[i].x)) === 1) {
            // 置いたコマ方のがY方向に大きい
            if (ownPieces[i].y < result.y) {
              if (ownPieces[i].x < result.x) {
                // 置いたコマの下から次のコマまで
                for (let j = 1; j <= (result.y - ownPieces[i].y); j += 1) {
                  // コマを取得
                  const targetPiece = await PieceModel.find({ x: result.x - j, y: result.y - j },
                    propFilter);

                  // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
                  if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                    flg = false;
                    break;
                  }
                }

                // めくる処理
                if (flg) {
                  for (let j = 1; j < (result.y - ownPieces[i].y); j += 1) {
                    await PieceModel.update({ x: result.x - j, y: result.y - j },
                      { $set: { userId: result.userId } });
                  }
                  removeFlg = false;
                }
              } else if (ownPieces[i].x > result.x) {
                // 置いたコマの下から次のコマまで
                for (let j = 1; j <= (result.y - ownPieces[i].y); j += 1) {
                  // コマを取得
                  const targetPiece = await PieceModel.find({ x: result.x + j, y: result.y - j },
                    propFilter);

                  // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
                  if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                    flg = false;
                    break;
                  }
                }

                // めくる処理
                if (flg) {
                  for (let j = 1; j < (result.y - ownPieces[i].y); j += 1) {
                    await PieceModel.update({ x: result.x + j, y: result.y - j },
                      { $set: { userId: result.userId } });
                  }
                  removeFlg = false;
                }
              }
            // 置いたコマ方のがY方向に小さい
            } else if (ownPieces[i].y > result.y) {
              if (ownPieces[i].x < result.x) {
                // 置いたコマの下から次のコマまで
                for (let j = 1; j < (ownPieces[i].y - result.y); j += 1) {
                  // コマを取得
                  const targetPiece = await PieceModel.find({ x: result.x - j, y: result.y + j },
                    propFilter);

                  // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
                  if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                    flg = false;
                    break;
                  }
                }

                // めくる処理
                if (flg) {
                  for (let j = 1; j < (ownPieces[i].y - result.y); j += 1) {
                    await PieceModel.update({ x: result.x - j, y: result.y + j },
                      { $set: { userId: result.userId } });
                  }
                  removeFlg = false;
                }
              } else if (ownPieces[i].x > result.x) {
                // 置いたコマの下から次のコマまで
                for (let j = 1; j < (ownPieces[i].y - result.y); j += 1) {
                  // コマを取得
                  const targetPiece = await PieceModel.find({ x: result.x + j, y: result.y + j },
                    propFilter);

                  // コマが存在しない、またはコマは存在するが自分のコマの場合、処理を終了しめくらない
                  if (targetPiece.length === 0 || targetPiece[0].userId === result.userId) {
                    flg = false;
                    break;
                  }
                }

                // めくる処理
                if (flg) {
                  for (let j = 1; j < (ownPieces[i].y - result.y); j += 1) {
                    await PieceModel.update({ x: result.x + j, y: result.y + j },
                      { $set: { userId: result.userId } });
                  }
                  removeFlg = false;
                }
              }
            }
          }
        }
      }
      //
      if (removeFlg && ownPieces.length > 0) {
        putPieceFlg = false;
      }

      // 登録処理
      if (putPieceFlg) {
        const Piece = new PieceModel(result);
        await Piece.save();
      }
    }
    // 送信処理
    const allPieces = await PieceModel.find({}, propFilter);
    // console.log(allPieces);
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
