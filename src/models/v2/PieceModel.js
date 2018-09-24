let pieces = [];

module.exports = {
  addPiece(piece) {
    pieces.push(piece);
  },
  getPieces() {
    return {
      pieces,
    };
  },
  resetPieces() {
    pieces = [];
  },
  array2Pieces(fieldSource) {
    const field = [];
    for (let i = 0; i < fieldSource.length; i += 1) {
      if (Array.isArray(fieldSource[i])) {
        field.push(fieldSource[i][0]);
      } else {
        field.push(fieldSource[i]);
      }
    }
    const array = [];
    let order = []; //  配列順番
    const sqrt = Math.sqrt(field.length); // 平方根
    const fieldExist = field.filter(n => n !== 0); // コマだけを抽出
    // 配列をプレイ順で並び替え
    const playOrder = fieldExist.sort((a, b) => (parseInt(a.slice(a.indexOf(':') + 1), 10)) - (parseInt(b.slice(b.indexOf(':') + 1), 10)));
    // それぞれが元の配列の何番目か
    order = playOrder.map(n => field.indexOf(n, 0));

    let n = 0;
    let elm = {};
    for (let i = 0; i < order.length; i += 1) { // x, y, userIdを生成する
      const x = order[i] % sqrt;
      const y = Math.floor(((field.length - 1) - order[i]) / sqrt);
      const userId = parseInt(playOrder[n].slice(playOrder[n].indexOf(':') - 1), 10);
      elm = { x, y, userId };
      n += 1;
      array.push(elm);
    }
    return array; // 打ち手の順で生成した配列をreturn
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
};
