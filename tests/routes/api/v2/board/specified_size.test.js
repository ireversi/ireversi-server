const chai = require('chai');
const app = require('../../../../../src/routes/app.js');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const calcCandidates = require('../../../../../src/routes/api/v2/board/calcCandidate');
const calcScore = require('../../../../../src/routes/api/v2/board/calcScore');

const basePath = '/api/v2';

function convertResult(result, xMin, yMin) {
  const fPieces = [];
  const size = Math.sqrt(result.length);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0) {
      const piece = {
        x: Math.floor(i % size) + xMin,
        y: Math.floor(i / size) + yMin,
        userId: result[i],
      };
      fPieces.push(piece);
    }
  }
  return fPieces;
}

describe('board/specified_size', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('gets specified range', async () => {
    // Given
    const xMin = 1;
    const xMax = 3;
    const yMin = 1;
    const yMax = 3;
    const userId = 1;

    const testCase = [
      0, 0, 0, 0, 0,
      0, 1, 2, 0, 0,
      4, 5, 0, 7, 1,
      0, 9, 0, 2, 0,
      0, 0, 0, 0, 0,
    ];

    const size = Math.sqrt(testCase.length);

    testCase.forEach((elm, index) => {
      if (elm !== 0) {
        const ans = {
          x: Math.floor(index % size),
          y: Math.floor(index / size),
          userId: elm,
        };
        PieceStore.addPiece(ans);
      }
    });

    const result = [
      1, 2, 0,
      5, 0, 7,
      9, 0, 2,
    ];
    const ansResult = convertResult(result, xMin, yMin);
    const entireBoard = PieceStore.getPieces();
    const ansCandidates = calcCandidates.calc(userId, entireBoard);

    const score = calcScore.calc(userId, entireBoard);

    // const result = boardStore.getBoard().pieces;
    const matchers = {
      pieces: ansResult,
      candidates: ansCandidates,
      standbys: [],
      score,
      size: {
        x_min: xMin,
        x_max: xMax,
        y_min: yMin,
        y_max: yMax,
      },
    };
    // await Promise.all(matchers.map(m => PieceStore(m).save()));

    // When
    const response = await chai.request(app).get(`${basePath}/board/specified_size?x_min=${xMin}&x_max=${xMax}&y_min=${yMin}&y_max=${yMax}&userId=${userId}`);
    // Then
    // expect(response.body).toHaveLength(matchers.length);
    expect(response.body).toEqual(matchers);
  });
});
