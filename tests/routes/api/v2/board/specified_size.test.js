const chai = require('chai');
const jwt = require('jsonwebtoken');
const app = require('../../../../../src/routes/app.js');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
// const calcCandidates = require('../../../../../src/routes/api/v2/board/calcCandidate');
// const calcScore = require('../../../../../src/routes/api/v2/board/calcScore');
const generateToken = require('../../../../../src/routes/api/v2/userIdGenerate/generateToken');


const basePath = '/api/v2';

function genJwtArr(number) {
  const jwtIds = [];
  for (i = 0; i < number; i += 1) {
    const jwtElm = {};
    tempJwt = generateToken.generate();
    jwtElm.jwtId = tempJwt;
    jwtElm.decode = jwt.decode(tempJwt).userId;
    jwtIds.push(jwtElm);
  }
  return jwtIds;
}

function convertComparisonResult(result) {
  const fPieces = [];
  const size = Math.sqrt(result.length);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0) {
      const x = Math.floor(i % size);
      const y = Math.floor(i / size);
      let userId;
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
describe('board/specified_size', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  // userIdの生成
  jwtIds = genJwtArr(9);

  // 一つ駒を置く
  it('gets specified range', async () => {
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    // Given
    // const xMin = 1;
    // const xMax = 3;
    // const yMin = 1;
    // const yMax = 3;
    let userId = jwtIds[0].decode;

    const testCase = convertComparisonResult([
      0, 0, 0, 0, 0,
      0, userId, jwtIds[1].decode, 0, 0,
      jwtIds[2].decode, jwtIds[3].decode, 0, jwtIds[4].decode, userId,
      0, jwtIds[5].decode, 0, jwtIds[1].decode, 0,
      0, 0, 0, 0, 0,
    ]);

    const size = Math.sqrt(testCase.length);

    testCase.forEach((elm, index) => {
      if (elm !== 0) {
        const x = Math.floor(index % size);
        const y = Math.floor(index / size);
        userId = elm;
        PieceStore.addPiece({ x, y, userId });
      }
    });

    // const result = [
    //   userId.userId, jwtIds[1].decode, 0,
    //   jwtIds[3].decode, 0, jwtIds[4].decode,
    //   jwtIds[5].decode, 0, jwtIds[1].decode,
    // ];
    // const ansResult = convertComparisonResult(result, xMin, yMin);
    // const entireBoard = PieceStore.getPieces();
    // const ansCandidates = calcCandidates.calc(userId, entireBoard);
    // const score = calcScore.calc(userId, entireBoard);

    // const result = boardStore.getBoard().pieces;
    // const matchers = {
    //   pieces: ansResult,
    //   candidates: ansCandidates,
    //   standbys: [],
    //   score,
    //   size: {
    //     xMin: 0,
    //     xMax: 4,
    //     yMin: 1,
    //     yMax: 3,
    //   },
    // };
    // await Promise.all(matchers.map(m => PieceStore(m).save()));

    // When
    // const response = await chai.request(app)
    //   .get(`${basePath}/board/specified_size?x_min=${xMin}&x_max=${xMax}&
    // y_min=${yMin}&y_max=${yMax}`)
    //   .set('Authorization', jwtIds[0].jwtId);
    // Then
    // expect(response.body).toHaveLength(matchers.length);
    // expect(response.body).toEqual(matchers);
  });
});
