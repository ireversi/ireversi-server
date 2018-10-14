const StandbyStore = require('./StandbyStore.js');
const calcScore = require('../../routes/api/v2/board/calcScore.js');

const board = {
  pieces: [],
  candidates: [],
  standbys: [],
  score: 0,
  size: {},
};

const waitTime = StandbyStore.getWaitTime();

module.exports = {
  addPiece(piece) { // 盤面にコマを追加する
    board.pieces.push(piece);
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
  addSize(boardSize) {
    board.size = boardSize;
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
  getBoard(userId) {
    const sendStandbys = this.getStandbys();
    const sendScore = calcScore.calc(userId, board.pieces);
    const sendBoard = {
      pieces: board.pieces,
      candidates: board.candidates,
      standbys: sendStandbys,
      score: sendScore,
      size: board.size,
    };
    return sendBoard;
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
