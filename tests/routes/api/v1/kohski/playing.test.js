const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/kohski/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

describe('play', () => {
  beforeAll(prepareDB);   //全てのテストをやる前に1回だけ呼ばれる。
  afterEach(deleteAllDataFromDB);

  // ここからtaskで作成したテスト
  describe('put piece', () => {
    it('puts a piece', async () => {
      // Given
      const piece ={
        x:0,
        y:0,
        userID:1
      }
      
      // When
      const response = await chai.request(app)
        .post(`${basePath}/kohski/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);

      // Then
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(piece);

      const pieces = await PlayingModel.find({});
      expect(pieces).toHaveLength(1);
      expect(pieces[0]).toMatchObject(piece);
    });
  });
});
