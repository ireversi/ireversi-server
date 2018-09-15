const chai = require('chai');

const app = require('../../../../../src/routes/app.js'); // express引っ張ってきてサーバー立てる
const PlayingModel = require('../../../../../src/models/kai/PlayingModel.js'); // Mongoテーブル引っ張ってくる

const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

const array2Pieces = (field) => {
  const array = [];
  let order = [];
  const sqrt = Math.sqrt(field.length); // 平方根
  const fieldExist = field.filter(n => n !== 0); // コマだけを抽出
  order = fieldExist.map(n => field.indexOf(n, 0)); // 元の配列の何番目に存在するか
  let elm = {};
  for (let i = 0; i < order.length; i += 1) { // x, y, userIdを生成する
    const x = order[i] % sqrt;
    const y = Math.floor(((field.length - 1) - order[i]) / sqrt);
    const userId = field[order[i]];
    elm = { x, y, userId };
    array.push(elm);
  }
  return array; // 打ち手の順で生成した配列をreturn
};

describe('Delete all pieces', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('board', () => {
    it('is cleared', async () => {
      // Given
      // 与えたい配列
      const pieces = array2Pieces(
        [
          0, 0, 0, 0, 8,
          0, 1, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 2, 0, 0, 5,
          1, 0, 0, 0, 3,
        ],
      );

      const empty = {};

      // When
      let response;
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/kai/delete`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      // 配列 === 長さ
      expect(response.body).toEqual(empty);

      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({})));
      expect(pieceData).toEqual(expect.not.arrayContaining(pieces));
    });
  });
});
