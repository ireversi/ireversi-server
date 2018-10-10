const chai = require('chai');
const app = require('../../../../../src/routes/app.js');
// const boardStore = require('../../../../../src/models/v2/BoardStore.js');
const pieceStore = require('../../../../../src/models/v2/PieceStore.js');

const basePath = '/api/v2/board';

function convertComparisonResult(result) {
  const fPieces = [];
  const size = Math.sqrt(result.length);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0) {
      const x = Math.floor(i % size);
      const y = Math.floor(i / size);
      let userId = 0;
      if (result[i] === 'I') {
        userId = 1;
      } else {
        userId = result[i];
      }

      const piece = {
        x,
        y,
        userId,
      };
      fPieces.push(piece);
    }
  }
  return fPieces;
}

function convertComparisonMatchers(result) {
  // 他のテストと違って原点を中心にずらしている。
  const fPieces = [];
  const size = Math.sqrt(result.length);
  const half = Math.floor(size / 2);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0 && typeof (result[i]) === 'number') {
      const piece = {
        x: Math.floor(i % size) - half,
        y: Math.floor(i / size) - half,
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
    await chai.request(app).delete(`${basePath}`);
    // Given
    // "I"は初期化した時の最初のピース
    const userId = 1;
    const result = [
      'I', 1, 0, 0, 0,
      0, 1, 2, 1, 0,
      4, 5, 6, 7, 1,
      0, 9, 0, 2, 0,
      0, 0, 0, 0, 0,
    ];
    // const result = boardStore.getBoard().pieces;
    const matchers = convertComparisonResult(result);
    const size = Math.sqrt(result.length);

    result.forEach((elm, index) => {
      if (elm !== 0 && elm !== 'I') {
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
    const response = await chai.request(app).get(`${basePath}/?userId=${userId}`);
    // Then
    expect(response.body.pieces).toHaveLength(matchers.length);
    expect(response.body.pieces).toEqual(expect.arrayContaining(matchers));
  });
});

describe('board after turnover', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('gets pieces after turnover some pieces', async () => {
    await chai.request(app).delete(`${basePath}`);
    // Given
    // 'I'はイニシャルピース
    const resultPre = [
      'I', 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ];
    // first_pieceを取り込み
    const sizePre = Math.sqrt(resultPre.length);
    resultPre.forEach((elm, index) => {
      if (elm !== 0) {
        const ans = {
          x: Math.floor(index % sizePre),
          y: Math.floor(index / sizePre),
          userId: elm,
        };
        pieceStore.addPiece(ans);
      }
    });
    // 2nd piece set
    const resultFol = [
      0, 0, 0, 0,
      2, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ];
    // second_pieceを取り込み
    const sizeFol = Math.sqrt(resultFol.length);
    resultFol.forEach((elm, index) => {
      if (elm !== 0) {
        const ans = {
          x: Math.floor(index % sizeFol),
          y: Math.floor(index / sizeFol),
          userId: elm,
        };
        pieceStore.addPiece(ans);
      }
    });
    const userId = 3;
    const matchers = convertComparisonMatchers([
      0, 0, 0, 0, 0,
      0, 0, userId, 0, 0,
      0, userId, '1', userId, 0,
      0, userId, '2', userId, 0,
      0, 0, userId, 0, 0,
    ]);
    // await Promise.all(matchers.map(m => PieceStore(m).save()));

    // When
    const response = await chai.request(app).get(`${basePath}/?userId=${userId}`);
    // Then
    expect(response.body.candidates).toHaveLength(matchers.length);
    expect(response.body.candidates).toEqual(expect.arrayContaining(matchers));
  });
});
