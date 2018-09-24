// ありとあらゆる配列が入る
const pieces = [];
const candidates = [];
const standbys = [];

module.exports = {
  addPiece(piece) {
    pieces.push(piece);
  },
  getBoard() {
    return {
      pieces,
      candidates,
      standbys,
    };
  },
};
