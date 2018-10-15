// const chai = require('chai');

// const app = require('../../src/routes/app.js');

// const basePath = '/api/v2';

const calcScore = require('../../src/routes/api/v2/board/calcSize.js');

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

describe('calcSize', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('calcs size', async () => {
    // Given
    userId = 2;
    const testCase = convertComparisonResult(
      [
        0, 0, 0, 0, 0,
        0, 1, 2, 0, 0,
        0, 1, 2, 0, 0,
        0, 0, 1, 2, 1,
        0, 0, 2, 0, 0,
      ],
    );

    const answer = {
      xMin: 1,
      xMax: 4,
      yMin: 1,
      yMax: 4,
    };

    // When
    const response = calcScore.calc(testCase);
    // Then
    expect(response).toEqual(answer);
  });
});
