const PieceStore = require('./PieceStore.js');
const calcScore = require('../../routes/api/v2/board/calcScore.js');

module.exports = {
  getBoard(userId) {
    const pieces = PieceStore.getPieces();
    const candidates = PieceStore.getCandidates();
    const standbys = PieceStore.getStandbys();
    const score = calcScore.calc(userId, pieces);
    const size = PieceStore.getSize();
    return {
      pieces,
      candidates,
      standbys,
      score,
      size,
    };
  },
};
