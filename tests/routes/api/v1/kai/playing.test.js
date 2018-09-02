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

// 与えたい配列
const array2Pieces = function(){
  let array = [];
  let field = [
    0, 0, 0, '1:3',
    0, 0, '2:2', 0,
    0, '1:1', 0, '3:4',
    0, 0, 0, 0,
  ];
  let fieldExist = field.filter((n) => n !== 0); // コマだけを抽出
  let playOrder = fieldExist.sort((a, b) => { // 配列をプレイ順で並び替え
    return (parseInt(a.slice(a.indexOf(':')+1))) - (parseInt(b.slice(b.indexOf(':')+1)));
  });
  let n = 0;
  for (let i = 0; i < field.length; i++) { // x, y, userIdを生成する
    let elm = {}; //
    if (field[i] !== 0) { // 打ち手が存在するコマのみ
      let x = i % 4;
      let y = Math.floor((15 - i)/4);
      let userId = parseInt(playOrder[n].slice(playOrder[n].indexOf(':')-1));
      elm = {x: x, y: y, userId: userId};
      n++;
      array.push(elm);
    }
  }
  // console.log(array);
  return array;
};

// 理想の配列
const array2Mathcers = function(){
  let array = [];
  let field = [
    0, 0, 0, 1,
    0, 0, 1, 0,
    0, 1, 0, 3,
    0, 0, 0, 0,
  ];
  for (let i = 0; i < field.length; i++) { // x, y, userIdを生成する
    let elm = {}; //
    if (field[i] !== 0) { // 打ち手が存在するコマのみ
      let x = i % 4;
      let y = Math.floor((15 - i)/4);
      let userId = field[i];
      elm = {x: x, y: y, userId: userId};
      array.push(elm);
    }
  }
  console.log(array);
  return array;
};


describe('Request piece', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('create', () => {
    it('creates piece', async () => {
      // Given
      const playingMatcher = {
        x: 0,
        y: 0,
        userId: 1,
      };

      const response = await chai.request(app)
        .post(`${basePath}/kai/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(playingMatcher);

      // Then
      expect(response.body).toHaveLength(1);
      expect(response.body).toMatchObject([playingMatcher]);

      const pieces = await PlayingModel.find();
      expect(pieces).toHaveLength(1);
      expect(pieces).toMatchObject({}, propFilter);
    });

    it('creates pieces', async () => {
      // Given
      const pieces = [
        {
          x: 0,
          y: 0,
          userId: 1,
        },
        {
          x: 1,
          y: 0,
          userId: 2,
        }
      ];

      let response;
      for (let i = 0; i < pieces.length; i++) {
        response = await chai.request(app)
        .post(`${basePath}/kai/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
      }

      // Then
      // 配列 === 長さ
      expect(response.body).toHaveLength(pieces.length);
      // 配列 === 入っているものが一緒かどうか
      expect(response.body).toEqual(expect.arrayContaining(pieces));

      // _id と __v を省いた配列
      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(pieces.length);
      expect(pieceData).toEqual(expect.arrayContaining(pieces));
    });

    // 同じところに置けない
    //   座標に何かがあればエラーを返す
    //   x, y座標しか使わない
    //   投げる配列（同じ箇所に置こうとする）と、動作後の理想の配列を用意
    it('cannot put on same cell', async () => {
      // Given
      // 与えたい配列
        // 同じ箇所に置こうとする
      const pieces = [
        {
          x: 0,
          y: 0,
          userId: 1,
        },
        { // ここで同じ場所に置こうとする
          x: 0,
          y: 0,
          userId: 2,
        },
        {
          x: 0,
          y: 1,
          userId: 2
        }
      ];

      // 理想の配列
      const matches = [
        {
          x: 0,
          y: 0,
          userId: 1
        },
        {
          x: 0,
          y: 1,
          userId: 2
        }
      ];

      // When
      let response;
      for (let i = 0; i < pieces.length; i++) {
        response = await chai.request(app)
        .post(`${basePath}/kai/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
      }

      // Then
      // 配列 === 長さ
      expect(response.body).toHaveLength(matches.length); //expectが希望で、toHaveLengthが現実のデータ
      // 配列 === 入っているものが一緒かどうか
      expect(response.body).toEqual(expect.arrayContaining(matches));

      // _id と __v を省いた配列
      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(matches.length);
      expect(pieceData).toEqual(expect.arrayContaining(matches));
    });

    // 挟んだらめくれる
    // x: 0, y: 0, userId: a
    // x: 0, y: 1, userId: b → aに変わる
    // x: 0, y: 2, userId: a
    // it('can flip', async () => {
    //   // Given
    //   // 与えたい配列
    //   const pieces = new array2Pieces;
    //   console.log(pieces);

    //   // 理想の配列
    //   const matches = new array2Mathcers;
    //   console.log(matches);


    //   // When
    //   let response;
    //   for (let i = 0; i < pieces.length; i++) {
    //     response = await chai.request(app)
    //     .post(`${basePath}/kai/playing`)
    //     .set('content-type', 'application/x-www-form-urlencoded')
    //     .send(pieces[i]);
    //     // console.log(pieces[i]);
    //   }

    //   // Then
    //   // 配列 === 長さ
    //   expect(response.body).toHaveLength(matches.length); //expectが希望で、toHaveLengthが現実のデータ
    //   // 配列 === 入っているものが一緒かどうか
    //   expect(response.body).toEqual(expect.arrayContaining(matches));

    //   // _id と __v を省いた配列
    //   const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
    //   expect(pieceData).toHaveLength(matches.length);
    //   expect(pieceData).toEqual(expect.arrayContaining(matches));
    // });
  });
});

// 離れたところにおけない（上下左右隣接）
  // 配列に自分のuserIdが存在しないときに置く
  // 座標上下左右
    // xがプラスマイナス１
    // yがプラスマイナス１の場所に
    // 何かしらがあれば置ける
// ちゃんとめくれるところにしか置けない
  // 縦横斜めの先に自分のコマがあるかをみにいく
    //
