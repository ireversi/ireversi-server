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

describe('Request piece', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('show', () => {
    it('shows piece', async () => {
      // jestにおいてはitとtestもどちらも変わらない
      // 文になっていることが好ましい

      // Given テストする上での初期状態
      // 
      const x = 0;
      const y = 0;
      const userId = 1;
      const Playing = new PlayingModel({ //データベースに入っている初期状態
        x,
        y,
        userId,
      });
      await Playing.save();

      // When アクション内容
      // appはexpressそのもの
      // getで取りに行く

      const response = await chai.request(app)
        .get(`${basePath}/kai/playing`)
        .query({ userId }); // userId: userId だったら省略できるというES6の文法

      // Then 結果がこうあってほしい
      expect(response.body).toMatchObject({
        x,
        y,
        userId,
      });
    });

    it('return null when the piece does not exist', async () => {
      // Given
      const userId = 1;

      // When
      const response = await chai.request(app)
        .post(`${basePath}/kai/playing`)
        .query({ userId });

      // Then
      expect(response.body).toBeNull;
    });
  });

  describe('create', () => {
    it('creates piece', async () => {
      // Given
      const x = 0;
      const y = 0;
      const userId = 1;

      // When
      const playingMatcher = {
        x,
        y,
        userId
      };

      const response = await chai.request(app)
        .post(`${basePath}/kai/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(playingMatcher);

      // Then
      expect(response.body).toMatchObject({ status: 'success' });
      const playing = await PlayingModel.findOne({ userId });
      expect(playing).toMatchObject(playingMatcher);
    });
  });
});