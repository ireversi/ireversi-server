const board = {
  pieces: [],
  candidates: [],
  standbys: [],
  score: Number,
  size: {},
};
const waitTime = 3000; // remainingに設定する待ち時間

module.exports = {
  addPiece(piece) { // 盤面にコマを追加する
    board.pieces.push(piece);
  },
  addStandby(standby) {
    board.standbys.push(standby);
  },
  deletePieces() {
    board.pieces.length = 0;
  },
  getBoard() {
    return board;
  },
  getPieces() {
    return board.pieces;
  },
  getStandbys() {
    return board.standbys;
  },
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
      const userId = parseInt(playOrder[n][1].slice(playOrder[n][1].indexOf(':') - 1), 10);
      elm = { x, y, userId };
      n += 1;
      array.push(elm);
    }
    return array;
  },
  array2Matchers(source) {
    const array = []; // 返す配列
    const sqrt = Math.sqrt(source.length); // 平方根
    const sourceExist = [];
    for (let i = 0; i < source.length; i += 1) {
      const f = source[i];
      if (Array.isArray(f)) {
        const g = [i, f[0], true];
        sourceExist.push(g);
        for (let j = 1; j < f.length; j += 1) {
          const h = [i, f[j], false];
          sourceExist.push(h);
        }
      } else if (f !== 0) {
        const g = [i, f, true];
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
      const userId = parseInt(playOrder[n][1].slice(playOrder[n][1].indexOf(':') - 1), 10);
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
  seeNext(array, nextPieceX, nextPieceY) {
    return array.find(p => p.x === nextPieceX && p.y === nextPieceY);
  },
  array2Standby(array) {
    const results = [];
    const status = true;
    const matchArray = this.array2Matchers(array);
    for (let i = 0; i < matchArray.length; i += 1) {
      const result = {};
      result.status = status;
      const match = matchArray[i];
      const standby = {
        remaining: 3000,
        piece: match,
      };
      result.standby = standby;
      results.push(result);
    }
    return results;
  },
  getWaitTime() {
    return waitTime;
  },
};
