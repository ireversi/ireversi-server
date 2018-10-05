const chai = require('chai');
const app = require('../../../../../src/routes/app.js');
// const boardStore = require('../../../../../src/models/v2/BoardStore.js');
const pieceStore = require('../../../../../src/models/v2/PieceStore.js');

const basePath = '/api/v2';

function convertComparisonResult(result) {
  const fPieces = [];
  const size = Math.sqrt(result.length);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0) {
      const piece = {
        x: Math.floor(i % size),
        y: Math.floor(i / size),
        userId: result[i],
      };
      fPieces.push(piece);
    }
  }
  return fPieces;
}

describe('board', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('gets all', async () => {
    // Given
    const userId = 1;
    const result = [
      0, 0, 0, 0, 0,
      0, 1, 2, 1, 0,
      4, 5, 6, 7, 1,
      0, 9, 0, 2, 0,
      0, 0, 0, 0, 0,
    ];
    // const result = boardStore.getBoard().pieces;
    const matchers = convertComparisonResult(result);
    const size = Math.sqrt(result.length);

    result.forEach((elm, index) => {
      if (elm !== 0) {
        const ans = {
          x: Math.floor(index % size),
          y: Math.floor(index / size),
          userId: elm,
        };
        pieceStore.addPiece(ans);
      }
    });
    // await Promise.all(matchers.map(m => PieceStore(m).save()));

    // When
    const response = await chai.request(app).get(`${basePath}/board?user_id=${userId}`);
    // Then
    expect(response.body.pieces).toHaveLength(matchers.length);
    expect(response.body.pieces).toEqual(expect.arrayContaining(matchers));
  });
});
