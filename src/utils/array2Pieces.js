module.exports = {
  array2Pieces(source) {
    const array = []; // 返す配列
    const sqrt = Math.sqrt(source.length); // 平方根
    const sourceExist = [];
    for (let i = 0; i < source.length; i += 1) {
      const f = source[i];
      if (Array.isArray(f)) {
        for (let j = 0; j < f.length; j += 1) {
          const g = [i, f[j]];
          sourceExist.push(g);
        }
      } else if (f !== 0) {
        const g = [i, f];
        sourceExist.push(g);
      }
    }
    const playOrder = sourceExist.sort((a, b) => (parseInt(a[1].slice(a[1].indexOf(':') + 1), 10)) - (parseInt(b[1].slice(b[1].indexOf(':') + 1), 10)));
    let n = 0;
    let elm = {};
    for (let i = 0; i < playOrder.length; i += 1) { // x, y, userIdを生成する
      const order = playOrder[i][0];
      const x = order % sqrt;
      const y = Math.floor(((source.length - 1) - order) / sqrt);
      let userId = playOrder[n][1].slice(0, playOrder[n][1].indexOf(':'));
      if (!Number.isNaN(Number(userId))) {
        userId = Number(userId);
      }

      const status = playOrder[i][2];
      elm = {
        status,
        piece: {
          x,
          y,
          userId,
        },
      };
      n += 1;
      array.push(elm);
    }
    return array;
  },
};
