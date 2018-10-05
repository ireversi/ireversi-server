const pieceModel = require('./PieceStore.js');
// ありとあらゆる配列が入る
// 取りあえず初期値
const pieces = pieceModel.getPieces();
const candidates = [];
const standbys = [];
let score = 0;
let gSize = {};

module.exports = {
  // addPiece(piece) {
  //   pieces.push(piece);
  // },
  addCandidates(candidate) {
    candidates.push(candidate);
  },
  addScore(valscore) {
    score = valscore;
  },
  addSize(boardSize) {
    gSize = boardSize;
  },
  getBoard() {
    return {
      pieces,
      candidates,
      standbys,
      score,
      size: gSize,
    };
  },
};
