function seeNext(pieces, nextX, nextY) {
  const ans = pieces.find(p => p.x === nextX && p.y === nextY);
  return ans;
}

exports.calc = function calcCandidate(userId, pieces) {
  const candidates = [];
  // x軸方向、y軸方向を定義
  const dirXY = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  const dirAll = [
    ...dirXY,
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];

  // 全piece検索して、おいたpieceが初出かどうか取得
  let flag = false;
  pieces.forEach((elm) => {
    if (elm.userId === userId) {
      flag = true;
    }
  });
  if (flag === false) {
  // id初出時
    pieces.forEach((elm) => {
      for (let i = 0; i < dirXY.length; i += 1) {
        // x軸方向、y軸方向に検索
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];

        // 基準セルから1つ先をみる
        const toX = elm.x + dirX;
        const toY = elm.y + dirY;

        // 検索セルとしてパッケージ
        const dirPiece = {
          x: toX,
          y: toY,
          userId,
        };

        // dirPieceがすでにおいてあるセルと被らないか検索
        let searchFlag = true;
        pieces.forEach((p) => {
          if (p.x === toX && p.y === toY) {
            searchFlag = false;
          }
        });
        if (searchFlag === true) {
          // candidates内を重複検索してからpush
          let count = 0;
          candidates.forEach((element) => {
            if (element.x === dirPiece.x && element.y === dirPiece.y) {
              count += 1;
            }
          });
          if (count === 0) {
            // userIdを削除して格納
            delete dirPiece.userId;
            candidates.push(dirPiece);
          }
        }
      }
    });
  } else {
  // id既出時
    pieces.forEach((elm) => {
      if (elm.userId === userId) {
        for (let i = 0; i < dirAll.length; i += 1) {
          let dist = 1;
          let dupFlag = false;
          // ひっくり返るものがあったら貯めておく配列
          const turnCandidate = [];

          // x軸方向、y軸方向に検索
          const dirX = dirAll[i][0];
          const dirY = dirAll[i][1];

          // 基準セルから1つ先をみる
          const toX = elm.x + dirX * dist;
          const toY = elm.y + dirY * dist;

          // 検索セルとしてパッケージ
          let dirPiece = pieces.find(p => p.x === toX && p.y === toY);
          let nextPiece = {
            x: 0,
            y: 0,
            userId: 0,
          };
          while (dirPiece !== undefined) {
            if (elm.userId !== dirPiece.userId) {
              turnCandidate.push(dirPiece);
            }
            if (dirPiece.userId === elm.userId) {
              dupFlag = true;
            }
            dist += 1;
            const nextX = elm.x + dirX * dist;
            const nextY = elm.y + dirY * dist;
            nextPiece = {
              x: nextX,
              y: nextY,
            };
            dirPiece = seeNext(pieces, nextX, nextY);
          }
          if (turnCandidate.length > 0 && dupFlag === false) {
            candidates.push(nextPiece);
          }
        }
      }
    });
  }
  return candidates;
};
