// const chai = require('chai');

// const app = require('../../src/routes/app.js');

// const basePath = '/api/v2';

const calcScore = require('../../src/routes/api/v2/board/calcScore.js');

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
        1, 1, 2,
        3, 4, 0,
        0, 5, 0,
      ],
    );
    userId = 2;

    // When
    const response = calcScore.calc(userId, testCase);
    // Then
    expect(response).toBe(1);
  });
});
