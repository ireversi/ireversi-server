const chai = require('chai');

const app = require('../../../../src/routes/app.js'); // express引っ張ってきてサーバー立てる

const basePath = '/api/v2';

const array2Pieces = (field) => {
  const array = [];
  let order = []; //  配列順番
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

const array2Matchers = (field) => {
  const array = [];
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

describe('Flip piece', () => {
  describe('piece', () => {
    it('can flip', async () => {
      // Given
      const pieces = array2Pieces(
        [
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, '2:1', 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
        ],
      );

      // 理想の配列
      const matches = array2Matchers(
        [
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 2, 2, 2, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
        ],
      );


      // When
      let response;
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/piece/flip`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }
      console.log(response.body);


      // Then
      // 配列 === 長さ
      expect(response.body).toHaveLength(matches.length); // expectが希望で、toHaveLengthが現実のデータ
      // 配列 === 入っているものが一緒かどうか
      expect(response.body).toEqual(expect.arrayContaining(matches));

      // _id と __v を省いた配列
      // const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));

      // expect(pieceData).toHaveLength(matches.length);
      // expect(pieceData).toEqual(expect.arrayContaining(matches));
    });
  });
});
