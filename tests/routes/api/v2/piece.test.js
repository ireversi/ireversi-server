const chai = require('chai');
const pieceCtrl = require('../../../../src/models/v2/PieceModel.js');

const app = require('../../../../src/routes/app.js'); // express引っ張ってきてサーバー立てる

const basePath = '/api/v2';

describe('Playing test', () => {
  // Promise.allをアロー関数で使って、前提の配列を初期化する

  beforeAll(pieceCtrl.resetPieces());
  afterEach(pieceCtrl.resetPieces());

  // コマを置けるかのテスト
  describe('piece', () => {
    it('can put', async () => {
      // Given
      // コマを置く配列
      const pieces = pieceCtrl.array2Pieces(
        [
          0, 0, 0, 0, 0,
          0, 0, '1:1', 0, 0,
          0, 0, '2:2', 0, 0,
          0, 0, 0, '3:3', 0,
          0, 0, 0, 0, 0,
        ],
      );

      // 最終的に期待する配列
      const matches = pieceCtrl.array2Matchers(
        [
          0, 0, 0, 0, 0,
          0, 0, 1, 0, 0,
          0, 0, 2, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
        ],
      );

      // When
      let response;
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/piece/piece`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
        console.log(pieces[i]);
      }
      console.log(response.body);

      // Then
      expect(response.body).toHaveLength(matches.length);
      expect(response.body).toEqual(expect.arrayContaining(matches));
    });
  });

  // 置いてめくれるテスト
  describe('piece', () => {
    it('can flip', async () => {
      // Given
      // コマを置く配列
      const pieces = pieceCtrl.array2Pieces(
        [
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, '2:1', 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
        ],
      );
      console.log(pieces);


      // 最終的に期待する配列
      const matches = pieceCtrl.array2Matchers(
        [
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 2, 2, 2, 0,
          0, 0, 0, 3, 0,
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

      // Then
      expect(response.body).toHaveLength(matches.length);
      expect(response.body).toEqual(expect.arrayContaining(matches));
    });
  });
});
