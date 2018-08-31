const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/homework/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

describe('play', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('put piece', () => {
    it('puts a piece', async () => {
      // Given
      const piece = {
        x:0,
        y:0,
        userId: 1,
      },

      // When
      const response = await chai.request(app)
        // .post(`${basePath}/users`)
        .post(`${basePath}/homeowork/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);

      // Then
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(piece);

      const pieces = await PlayingModel.find();
      expect(pieces).toHaveLength(1);
      expect(pieces[0]).toMatchObject(piece);
    });
  });
});
