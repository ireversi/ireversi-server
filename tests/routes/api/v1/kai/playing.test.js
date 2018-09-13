const chai = require('chai');

// vue.jsだと import chai from 'chai':
// chaiの中は↓のことをしている
// 仕様名：ES6(フロント側に多い)
// import chai form 'chai';
// export default () => {};

// nodeだと require
// 仕様名：common js（サーバー側に多い）
// Nodeの書き方を他のサーバー言語に近しいものにするため

// 送信先の都合に合わせて、どちらの書き方にするか決める
// フロント主導: import, サーバー主導: require
// Nodeは標準でモジュールバンドラが入っているから、requireしたあとexportできる

const app = require('../../../../../src/routes/app.js'); // express引っ張ってきてサーバー立てる
const PlayingModel = require('../../../../../src/models/kai/PlayingModel.js'); // Mongoテーブル引っ張ってくる
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';
const propFilter = '-_id -__v';
let order = []; //  配列順番
// 与えたい配列
const array2Pieces = (field) => {
  const array = [];
  const sqrt = Math.sqrt(field.length); // 平方根
  const fieldExist = field.filter(n => n !== 0); // コマだけを抽出

  // 配列をプレイ順で並び替え
  const playOrder = fieldExist.sort((a, b) => (parseInt(a.slice(a.indexOf(':') + 1), 10)) - (parseInt(b.slice(b.indexOf(':') + 1), 10)));
  // それぞれが元の配列の何番目か
  order = playOrder.map(n => field.indexOf(n, 0));

  let n = 0;
  let elm = {};
  for (let i = 0; i < order.length; i += 1) { // x, y, userIdを生成する
    const x = order[i] % sqrt;
    const y = Math.floor(((field.length - 1) - order[i]) / sqrt);
    const userId = parseInt(playOrder[n].slice(playOrder[n].indexOf(':') - 1), 10);
    elm = { x, y, userId };
    n += 1;
    array.push(elm);
  }
  return array; // 打ち手の順で生成した配列をreturn
};

const array = [];
const array2Matchers = (field) => {
  const sqrt = Math.sqrt(field.length);
  for (let i = 0; i < field.length; i += 1) {
    if (field[i] !== 0) {
      const x = i % sqrt;
      const y = Math.floor(((field.length - 1) - i) / sqrt);
      const userId = field[i];
      array.push({ x, y, userId });
    }
  }
  return array;
};

describe('Request piece', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('create', () => {
    it('can flip', async () => {
      // Given
      // 与えたい配列
      const pieces = array2Pieces(
        [
          0, '2:2', '2:7', 0, 0,
          0, '1:1', '5:5', 0, 0,
          0, '2:6', '3:3', 0, 0,
          0, 0, '4:4', '5:8', 0,
          0, 0, 0, 0, 0,
        ],
      );

      // 理想の配列
      const matches = array2Matchers(
        [
          0, 2, 0, 0, 0,
          0, 2, 5, 0, 0,
          0, 2, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
        ],
      );

      // When
      let response;
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/kai/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      // 配列 === 長さ
      expect(response.body).toHaveLength(matches.length); // expectが希望で、toHaveLengthが現実のデータ
      // 配列 === 入っているものが一緒かどうか
      expect(response.body).toEqual(expect.arrayContaining(matches));

      // _id と __v を省いた配列
      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));

      expect(pieceData).toHaveLength(matches.length);
      expect(pieceData).toEqual(expect.arrayContaining(matches));
    });
  });
});
