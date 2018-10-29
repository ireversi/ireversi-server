module.exports = {
  array2Matchers(source) {
    const array = []; // 返す配列
    const sqrt = Math.sqrt(source.length); // 平方根
    const sourceExist = [];
    // 送られた配列から0をスキップ、要素が配列になっているものをばらした配列を生成
    for (let i = 0; i < source.length; i += 1) {
      const element = source[i];
      if (Array.isArray(element)) { // 要素が配列の場合
        for (let j = 0; j < element.length; j += 1) {
          const h = [i, element[j]];
          sourceExist.push(h);
        }
      } else if (element !== 0) {
        const h = [i, element];
        sourceExist.push(h);
      }
    }
    // 要素にfがあるかないかでtrueかfalseを決定
    for (let i = 0; i < sourceExist.length; i += 1) {
      const el = sourceExist[i];
      const order = el[0];
      if (el[1].match(/:f/)) { // fがついていたらfalseを付与、なければtrueを付与
        const piece = el[1].replace(/:f/, ''); // :fの文字を削除
        sourceExist[i] = [order, piece, false];
      } else {
        sourceExist[i] = [order, el[1], true];
      }
    }

    // プレイ順に並び替え
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
