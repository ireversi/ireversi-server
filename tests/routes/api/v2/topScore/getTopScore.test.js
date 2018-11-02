const chai = require('chai');
const jwt = require('jsonwebtoken');
const app = require('../../../../../src/routes/app.js');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const generateToken = require('../../../../../src/routes/api/v2/userIdGenerate/generateToken.js');

const basePath = '/api/v2';
const zero = 0;

function userIdGenerate() {
  const token = generateToken.generate();
  return token;
}

function jwtDecode(token) {
  decoded = jwt.decode(token);
  return decoded;
}

function convertRanking(result, number) {
  const scores = [];
  // まずはuserIdの重複しないリストを作成
  // userIdの重複削除
  const ids = new Set(result);
  const idsArr = [...ids];
  // ゼロを削除
  const idx = idsArr.indexOf(0);
  if (idx !== -1) {
    idsArr.splice(idx, 1);
  }
  // userIdの各々について検索。score計算。
  idsArr.forEach((elm) => {
    let score = 0;
    result.forEach((cnt) => {
      if (elm === cnt) {
        score += 1;
      }
    });
    const idscore = {
      userId: elm,
      score,
    };
    scores.push(idscore);
  });

  // scoresの並び替え
  const sortedScores = scores.sort((a, b) => {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });
  const rank = number;
  const slicedScores = sortedScores.slice(0, rank);
  return slicedScores;
}

describe('score', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('gets score', async () => {
    await chai.request(app).delete(`${basePath}`);
    PieceStore.initPieces();

    // Given
    const id1 = jwtDecode(userIdGenerate()).userId;
    const id2 = jwtDecode(userIdGenerate()).userId;
    const id3 = jwtDecode(userIdGenerate()).userId;
    const id4 = jwtDecode(userIdGenerate()).userId;
    const id5 = jwtDecode(userIdGenerate()).userId;
    const id6 = jwtDecode(userIdGenerate()).userId;
    const id7 = jwtDecode(userIdGenerate()).userId;
    const id8 = jwtDecode(userIdGenerate()).userId;

    // "I"は初期化した時の最初のピース
    // 1:13,2:4,3:5,4:4,5:2,6:2,7:4,8:1
    const result = [
      'I', id1, id1, id1, id1, zero,
      id1, id1, id2, id2, id2, id2,
      id1, id3, id3, id3, zero, id4,
      id4, id4, zero, id3, id5, id5,
      id1, zero, id8, id1, zero, id6,
      id1, id7, id7, zero, id7, id6,
    ];
    // 上位何名まで反映するか
    number = 5;

    const size = Math.sqrt(result.length);
    result.forEach((elm, index) => {
      if (elm !== 0) {
        const ans = {
          x: Math.floor(index % size),
          y: Math.floor(index / size),
          userId: elm,
        };
        PieceStore.addPiece(ans);
      }
    });
    const matchers = convertRanking(result, number);
    const id1Jwt = userIdGenerate();

    // When
    const response = await chai.request(app)
      .get(`${basePath}/topScore?number=${number}`)
      .set('Authorization', id1Jwt);
    // Then
    expect(response.body).toEqual(expect.arrayContaining(matchers));
  });
});
