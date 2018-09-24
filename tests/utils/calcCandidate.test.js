// const chai = require('chai');

// const app = require('../../src/routes/app.js');

// const basePath = '/api/v2';

const calcCandidate = require('../../src/routes/api/v2/board/calcCandidate.js');

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


describe('calcCandidate', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('calcs candidates', async () => {
    // Given
    const testCase = convertComparisonResult(
      [
        0, 0, 0,
        0, 0, 0,
        0, 0, 1,
      ],
    );

    userId = 10;

    const matchers = convertComparisonResult(
      [
        0, 0, 0,
        0, userId, userId,
        0, userId, 0,
      ],
    );

    // await Promise.all(matchers.map(m => PieceModel(m).save()));
    // When
    const response = calcCandidate.calc(userId, testCase);
    // Then
    // console.log(response);
    // console.log(matchers);

    expect(response).toHaveLength(matchers.length);
    expect(response).toEqual(expect.arrayContaining(matchers));
  });
});
