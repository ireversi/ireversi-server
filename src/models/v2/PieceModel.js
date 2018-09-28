const pieces = [];

module.exports = {
  addPiece(piece) {
    pieces.push(piece);
  },
  updatePieces(piece) {
    pieces.find((p, i) => {
      if (p.x === piece.x && p.y === piece.y) {
        pieces.splice(i, 1);
        pieces.push(piece);
        return pieces;
      }
      return false;
    });
  },
  deletePieces() {
    pieces.length = 0;
  },
  getPieces() {
    return pieces;
  },
  array2Pieces(source) {
    const array = []; // 返す配列
    const sqrt = Math.sqrt(source.length); // 平方根
    const fieldExist = [];
    for (let i = 0; i < source.length; i += 1) {
      const f = source[i];

      if (Array.isArray(f)) {
        for (let j = 0; j < f.length; j += 1) {
          const g = [i, f[j]];
          fieldExist.push(g);
        }
      } else if (f !== 0) {
        const g = [i, f];
        fieldExist.push(g);
      }
    }
    const playOrder = fieldExist.sort((a, b) => (parseInt(a[1].slice(a[1].indexOf(':') + 1), 10)) - (parseInt(b[1].slice(b[1].indexOf(':') + 1), 10)));
    let n = 0;
    let elm = {};
    for (let i = 0; i < playOrder.length; i += 1) { // x, y, userIdを生成する
      const order = playOrder[i][0];
      const x = order % sqrt;
      const y = Math.floor(((source.length - 1) - order) / sqrt);
      const userId = parseInt(playOrder[n][1].slice(playOrder[n][1].indexOf(':') - 1), 10);
      elm = { x, y, userId };
      n += 1;
      array.push(elm);
    }
    return array;
  },
  array2Matchers(field) {
    const array = [];
    const sqrt = Math.sqrt(field.length);
    for (let i = 0; i < field.length; i += 1) {
      if (field[i] !== 0) {
        const x = i % sqrt;
        const y = Math.floor(((field.length - 1) - i) / sqrt);
        const userId = field[i];
        array.push({ x, y, userId });
      }
    }
    return array;
  },
  seeNext(array, nextPieceX, nextPieceY) {
    return array.find(p => p.x === nextPieceX && p.y === nextPieceY);
  },
};
