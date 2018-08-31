const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const Hi85PlayingModel = require('../../../../../src/models/hi85/PlayingModel.js');
const { prepareDB, deleteAllDataFromDB } = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';
const currentTestPath = `${basePath}/hi85/playing`;

describe('Request users', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('show', () => {
    it('shows an user', async () => {
      // Given
      const playingUserObject = {
        user_id: 1,
        x: 0,
        y: 0,
      };
      const hi85Playing = new Hi85PlayingModel(playingUserObject);
      await hi85Playing.save();

      // When
      const response = await chai
        .request(app)
        .get(currentTestPath)
        .query({ user_id: playingUserObject.user_id });

      // Then
      expect(response.body).toMatchObject(playingUserObject);
    });

    it('return null when the user does not exist', async () => {
      // Given
      const testUserId = 999;

      // When
      const response = await chai
        .request(app)
        .get(currentTestPath)
        .query({ user_id: testUserId });

      // Then
      expect(response.body).toBe(null);
    });
  });

  describe('create', () => {
    it('creates an user', async () => {
      // Given
      const playingUserObject = {
        user_id: 1,
        x: 0,
        y: 0,
      };
      // When
      const response = await chai
        .request(app)
        .post(currentTestPath)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(playingUserObject);
      // Then
      expect(response.body).toMatchObject({ status: 'success' });
      const testUserData = await Hi85PlayingModel.findOne({ user_id: playingUserObject.user_id });
      expect(testUserData).toMatchObject(playingUserObject);
    });
  });
});
