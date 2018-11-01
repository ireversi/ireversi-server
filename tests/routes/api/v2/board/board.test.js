const chai = require('chai');
const jwt = require('jsonwebtoken');
const app = require('../../../../../src/routes/app.js');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const generateToken = require('../../../../../src/routes/api/v2/userIdGenerate/generateToken');

const basePath = '/api/v2/board';
const zero = 0;

function userIdGenerate() {
  const token = generateToken.generate();
  return token;
}

function jwtDecode(token) {
  decoded = jwt.decode(token);
  return decoded;
}

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

function convertComparisonMatchers(result, idSl) {
  // 他のテストと違って原点を中心にずらしている。
  const fPieces = [];
  const size = Math.sqrt(result.length);
  const half = Math.floor(size / 2);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] === idSl) {
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
  // 一つ駒を置く
  it('gets all', async () => {
    await chai.request(app).delete(`${basePath}`);
    PieceStore.initPieces();

    // Given
    const idSelectedJwt = userIdGenerate();
    const idSl = jwtDecode(idSelectedJwt).userId;
    const id1 = jwtDecode(userIdGenerate()).userId;
    const id2 = jwtDecode(userIdGenerate()).userId;
    const id3 = jwtDecode(userIdGenerate()).userId;
    const id4 = jwtDecode(userIdGenerate()).userId;
    const id5 = jwtDecode(userIdGenerate()).userId;
    const id6 = jwtDecode(userIdGenerate()).userId;

    // "I"は初期化した時の最初のピース
    const result = [
      'I', idSl, zero, zero, zero,
      zero, idSl, id1, idSl, zero,
      id2, id3, id4, id5, idSl,
      zero, id6, zero, id1, zero,
      zero, zero, zero, zero, zero,
    ];
    const matchers = convertComparisonResult(result);
    const size = Math.sqrt(result.length);

    result.forEach((elm, index) => {
      if (elm !== 0 && elm !== 'I') {
        const ans = {
          x: Math.floor(index % size),
          y: Math.floor(index / size),
          userId: elm,
        };
        PieceStore.addPiece(ans);
      }
    });

    // When
    const response = await chai.request(app)
      .get(`${basePath}`)
      .set('Authorization', idSelectedJwt);

    // Then
    expect(response.body.pieces).toHaveLength(matchers.length);
    expect(response.body.pieces).toEqual(expect.arrayContaining(matchers));
  });
});

describe('board after turnover', () => {
  // 一つ駒を置く
  it('gets pieces after turnover some pieces', async () => {
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();

    // Given

    // 2nd piece set
    const id1Jwt = userIdGenerate();
    const id1 = jwtDecode(id1Jwt).userId;
    const resultFol = [
      zero, zero, zero, zero,
      id1, zero, zero, zero,
      zero, zero, zero, zero,
      zero, zero, zero, zero,
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
        PieceStore.addPiece(ans);
      }
    });
    const idSelectedJwt = userIdGenerate();
    const idSl = jwtDecode(idSelectedJwt).userId;
    const matchers = convertComparisonMatchers([
      zero, zero, zero, zero, zero,
      zero, zero, idSl, zero, zero,
      zero, idSl, 'I', idSl, zero,
      zero, idSl, id1, idSl, zero,
      zero, zero, idSl, zero, zero,
    ], idSl);

    // When
    const response = await chai.request(app)
      .get(`${basePath}`)
      .set('Authorization', idSelectedJwt);
    // Then
    expect(response.body.candidates).toHaveLength(matchers.length);
    expect(response.body.candidates).toEqual(expect.arrayContaining(matchers));
  });
});
