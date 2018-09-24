exports.calc = function calcCandidate(id, pieces) {
  const candidates = [];
  // x軸方向、y軸方向を定義
  const dirXY = [
    [0, 1],
    [1, 1],
    [0, -1],
    [-1, 0],
  ];

  // 全piece検索しておいたpieceが初出かどうか取得
  let flag = false;
  pieces.forEach((elm) => {
    if (elm.userId === id) {
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
          userId: id,
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
            candidates.push(dirPiece);
          }
        }
      }
    });
  } else {
  // id既出時


  }
  return candidates;
};
