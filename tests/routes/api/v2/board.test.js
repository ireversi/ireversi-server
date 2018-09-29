const chai = require('chai');
const app = require('../../../../src/routes/app.js');
const boardCtrl = require('../../../../src/models/v2/boardController.js');

const basePath = '/api/v2';

describe('board', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('gets all', async () => {
    // Given
    const result = boardCtrl.getBoard().pieces;

    const matchers = result;
    // await Promise.all(matchers.map(m => PieceModel(m).save()));

    // When
    const response = await chai.request(app).get(`${basePath}/board`);

    // Then
    expect(response.body.pieces).toHaveLength(matchers.length);
    expect(response.body.pieces).toEqual(expect.arrayContaining(matchers));
  });
});
