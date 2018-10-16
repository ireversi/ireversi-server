const StandbyStore = require('./StandbyStore.js');
const calcScore = require('../../routes/api/v2/board/calcScore.js');

const board = {
  pieces: [],
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

module.exports = {
  judgePiece(x, y, userId) {
    let status = false;
    const piece = { x, y, userId };
    const { pieces } = board;

    // ８方向に当たる値をコピー格納する配列
    const elected = [];
    for (let i = 0, e = pieces.length; i < e; i += 1) {
      const elPiece = pieces[i];
      const vectorX = Math.abs(elPiece.x - x);
      const vectorY = Math.abs(elPiece.y - y);
      if (elPiece.x === x && elPiece.y === y) { // 同じところ
        status = false;
        return status;
      }
      if (elPiece.x === x || elPiece.y === y) { // elPieceが送った値の縦横にある場合
        elected.push(elPiece);
      } else if (vectorX === vectorY) {
        elected.push(elPiece);
      }
    }

    const flip = [];
    // 盤面に自コマがある場合
    if (elected.find(p => p.userId === userId)) {
      let around = 0; // 周回した回数。最大8回。
      for (let i = 0; i < dirAll.length; i += 1) {
        const rslt = []; // 通って来たコマを一時保存する。めくれる条件のときはflipに移す。
        const dirX = dirAll[i][0];
        const dirY = dirAll[i][1];
        const aroundX = x + dirX;
        const aroundY = y + dirY;

        let n = 1;
        let dirPiece = this.seeNext(elected, aroundX, aroundY);

        if (dirPiece) {
          if (dirPiece.userId !== userId) {
            while (dirPiece) {
              if (dirPiece.userId !== userId) {
                rslt.push(dirPiece);
                n += 1;
                const nextPieceX = x + dirX * n;
                const nextPieceY = y + dirY * n;
                dirPiece = this.seeNext(elected, nextPieceX, nextPieceY);
              } else if (dirPiece.userId === userId) {
                this.addPiece(piece);
                status = true;
                for (let j = 0; j < rslt.length; j += 1) {
                  if (rslt[j] !== undefined) {
                    rslt[j].userId = userId;
                    flip.push(rslt[j]);
                  }
                }
                break;
              }
            }
          } else {
            status = false;
          }
        } else {
          around += 1;
          if (around === 8) {
            status = false;
          }
        }
      }
    // 他コマばかりで自コマがない場合、
    } else {
      // 上下左右を検索
      for (let i = 0; i < dirXY.length; i += 1) {
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];
        const aroundX = x + dirX;
        const aroundY = y + dirY;
        const dirPiece = elected.find(p => p.x === aroundX && p.y === aroundY);
        if (dirPiece !== undefined) { // 上下左右いずれかのとなりに他コマがある場合
          status = true;
          this.addPiece(piece);
          break;
        } else {
          status = false;
        }
      }
    }
    for (let i = 0; i < pieces.length; i += 1) {
      const p = pieces[i];
      for (let j = 0; j < flip.length; j += 1) {
        const f = flip[j];
        if (f.x === p.x && f.y === p.y) {
          p.userId = f.userId;
        }
      }
    }

    // コマを置いたときに一緒にサイズを確認し、送る
    if (status) {
      this.addSize();
    }
    return status;
  },
  addPiece(piece) { // 盤面にコマを追加する
    board.pieces.push(piece);
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
    const valueX = board.pieces.map(m => m.x);
    const valueY = board.pieces.map(m => m.y);

    const xMin = Math.min(...valueX);
    const xMax = Math.max(...valueX);
    const yMin = Math.min(...valueY);
    const yMax = Math.max(...valueY);
    board.size = {
      xMin,
      xMax,
      yMin,
      yMax,
    };

    return board.size;
  },
  deletePieces() {
    board.pieces.length = 0;
    this.initPieces(); // 初期値を置く
  },
  deleteStandbys() {
    board.standbys.length = 0;
  },
  deleteCandidates() {
    board.candidates.length = 0;
  },
  getPieces() {
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
    this.addPiece(
      {
        x: 0,
        y: 0,
        userId: 1,
      },
    );
    return board;
  },
  seeNext(array, nextPieceX, nextPieceY) {
    return array.find(p => p.x === nextPieceX && p.y === nextPieceY);
  },
  getWaitTime() {
    return waitTime;
  },
};
