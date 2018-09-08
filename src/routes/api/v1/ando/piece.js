const router = require('express').Router();

const PieceModel = require('../../../../models/ando/PieceModel.js');

const propFilter = '-_id -__v';

router.route('/')
  .post(async (req, res) => {
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };

    if ((await PieceModel.find({ x: result.x, y: result.y })).length === 0) {
      const Piece = new PieceModel(result);
      await Piece.save();
    }

    // let allPieces = await PieceModel.find({}, propFilter);

    // 自分のコマを抽出
    const ownPieces = await PieceModel.find({ userId: result.userId }, propFilter);

    // 自分のコマが存在して、かつ2コ以上のとき
    if (ownPieces && ownPieces.length >= 2) {
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
                await PieceModel.update({ x: result.x, y: j }, { $set: { userId: result.userId } });
              }
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
                await PieceModel.update({ x: result.x, y: j }, { $set: { userId: result.userId } });
              }
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
                await PieceModel.update({ x: j, y: result.y }, { $set: { userId: result.userId } });
              }
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
                await PieceModel.update({ x: j, y: result.y }, { $set: { userId: result.userId } });
              }
            }
          }

        // 斜め方向
        } else if (Math.abs((result.y - ownPieces[i].y) / (result.x - ownPieces[i].x)) === 1) {
          // 置いたコマ方のがY方向に大きい
          if (ownPieces[i].y < result.y) {
            if (ownPieces[i].x < result.x) {
              // 置いたコマの下から次のコマまで
              for (let j = 1; j < (result.y - ownPieces[i].y); j += 1) {
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
              }
            } else if (ownPieces[i].x > result.x) {
              // 置いたコマの下から次のコマまで
              for (let j = 1; j < (result.y - ownPieces[i].y); j += 1) {
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
              }
            }
          }
        }
      }
    }

    const allPieces = await PieceModel.find({}, propFilter);

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.json(allPieces);
  });

module.exports = router;
