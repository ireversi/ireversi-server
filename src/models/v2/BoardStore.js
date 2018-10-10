const PieceStore = require('./PieceStore.js');
// ありとあらゆる配列が入る
// 取りあえず初期値
const pieces = PieceStore.getPieces();
const candidates = PieceStore.getCandidates();
const standbys = PieceStore.getStandbys();
const score = PieceStore.getScore();
const gSize = PieceStore.getSize();

module.exports = {
  // addPiece(piece) {
  //   pieces.push(piece);
  // },
  addCandidates(candidate) {
    PieceStore.addCandidate(candidate);
  },
  initCandidates() {
    PieceStore.deleteCandidates();
  },
  addScore(valscore) {
    PieceStore.addScore(valscore);
  },
  addSize(boardSize) {
    PieceStore.addSize(boardSize);
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
