const StandbyStore = require('./StandbyStore.js');
const calcScore = require('../../routes/api/v2/board/calcScore.js');
const sendHistory = require('../../utils/sendPlayHistory');

const board = {
  pieces: new Map(),
  candidates: [],
  standbys: [],
  score: 0,
  size: {},
};

const dirXY = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

const dirAll = [
  ...dirXY,
  [-1, 1],
  [1, 1],
  [1, -1],
  [-1, -1],
];

const waitTime = StandbyStore.getWaitTime();

function judgeDirection(x, y, userId, nexts, results = []) {
  const nextCoordinate = [x + nexts[0], y + nexts[1]];
  const nextCoordinateUserId = board.pieces.get(nextCoordinate.join());
  if (nextCoordinateUserId === userId && results.length > 0) {
    return results;
  }
  if (nextCoordinateUserId && nextCoordinateUserId !== userId) {
    results.push([...nextCoordinate]);
    return judgeDirection(...nextCoordinate, userId, nexts, results);
  }
  return [];
}

module.exports = {
  judgePiece(x, y, userId) {
    const created = Date.now();
    const coordinate = [x, y].join();
    let status = false;
    // 置きたい座標のマスにすでにコマが存在するか判定
    if (board.pieces.has(coordinate)) return false;
    // 盤面に自分と同じ ID のコマが存在するか判定
    if ([...board.pieces.values()].indexOf(userId) < 0) {
      // 存在しない場合 : 置きたいマスの上下左右にコマが存在するか判定
      status = (dirXY.reduce((acc, cv) => {
        const result = board.pieces.has([x + cv[0], y + cv[1]].join()) ? acc + 1 : acc;
        return result;
      }, 0) > 0);
      if (status) board.pieces.set(coordinate, userId);
    } else {
      // 存在する場合 : 置きたいマスの周囲 8 方向に自分のコマにできるコマが存在するか判定
      const coordinates = dirAll.reduce((acc, cv) => {
        const result = acc.concat(judgeDirection(x, y, userId, cv));
        return result;
      }, [[x, y]]);
      if (coordinates.length > 1) {
        for (let i = 0; i < coordinates.length; i += 1) {
          board.pieces.set([coordinates[i][0], coordinates[i][1]].join(), userId);
        }
        status = true;
      }
    }
    this.addSize(); // コマを置くと同時にsizeを増やす
    if (status) {
      sendHistory.addPieceMongo(x, y, userId, created); // プレイ情報をMongoに送信
    }
    return status;
  },
  addPiece(piece) {
    // 盤面にコマを追加する
    board.pieces.set([piece.x, piece.y].join(), piece.userId);
    this.addSize();
  },
  addCandidate(candidate) {
    board.candidates.push(candidate);
  },
  addStandby(standby) {
    board.standbys.push(standby);
  },
  addScore(score) {
    board.score += score;
  },
  addSize() {
    const coordinate = [...board.pieces.keys()].pop().split(',');
    const x = +coordinate[0];
    const y = +coordinate[1];
    board.size = Object.keys(board.size).length === 0
      ? {
        xMin: x,
        xMax: x,
        yMin: y,
        yMax: y,
      }
      : {
        xMin: Math.min(board.size.xMin, x),
        xMax: Math.max(board.size.xMax, x),
        yMin: Math.min(board.size.yMin, y),
        yMax: Math.max(board.size.yMax, y),
      };
  },
  deletePieces() {
    board.pieces.clear();
    this.initPieces(); // 初期値を置く
  },
  deleteStandbys() {
    board.standbys.length = 0;
  },
  deleteCandidates() {
    board.candidates.length = 0;
  },
  getPieces() {
    const pieces = [...board.pieces];
    for (let i = 0; i < pieces.length; i += 1) {
      const coordinate = pieces[i][0].split(',');
      pieces[i] = {
        x: +coordinate[0],
        y: +coordinate[1],
        userId: pieces[i][1],
      };
    }
    return pieces;
  },
  getPiecesMap() {
    return board.pieces;
  },
  getStandbys() {
    const stbs = board.standbys;
    if (stbs.length >= 1) {
      for (let i = 0; i < stbs.length; i += 1) {
        const remaining = StandbyStore.getRemaining(stbs[i].created);
        if (remaining <= 0) {
          board.standbys.splice(i, 1);
        } else {
          board.standbys[i].remaining = remaining;
        }
      }
    }
    return board.standbys;
  },
  getCandidates() {
    return board.candidates;
  },
  getScore(userId) {
    const sendScore = calcScore.calc(userId, board.pieces);
    return sendScore;
  },
  getSize() {
    return board.size;
  },
  initPieces() {
    this.addPiece({
      x: 0,
      y: 0,
      userId: 1,
    });
    return board;
  },
  seeNext(array, nextPieceX, nextPieceY) {
    return array.find(p => p.x === nextPieceX && p.y === nextPieceY);
  },
  getWaitTime() {
    return waitTime;
  },
};
