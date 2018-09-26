
const chai = require('chai');

const app = require('../../../../src/routes/app.js');
// const PieceModel = require('../../../../src/models/v2/BoardStateModel.js');
// const {
//   prepareDB,
//   deleteAllDataFromDB,
// } = require('../../../../src/utils/db.js');

const basePath = '/api/v2';

function convertComparisonResult(result) {
  const pieces = [];
  const size = Math.sqrt(result.length);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0) {
      const piece = {
        x: Math.floor(i % size),
        y: Math.floor(i / size),
        userId: result[i],
      };
      pieces.push(piece);
    }
  }
  return pieces;
}


describe('board', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('gets all', async () => {
    // Given
    const result = [
      0, 0, 0, 0, 0,
      0, 1, 2, 3, 0,
      4, 5, 6, 7, 8,
      0, 9, 0, 0, 0,
      0, 0, 0, 0, 0,
    ];

    const matchers = convertComparisonResult(result);
    // await Promise.all(matchers.map(m => PieceModel(m).save()));

    // When
    const response = await chai.request(app).get(`${basePath}/board`);

    // Then
    expect(response.body.pieces).toHaveLength(matchers.length);
    expect(response.body.pieces).toEqual(expect.arrayContaining(matchers));
  });
});
