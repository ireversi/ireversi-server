const chai = require('chai');

const app = require('../../../../../src/routes/app');
const PlayingModel = require('../../../../../src/models/momii/PlayingModel');

// const {
//   prepareDB,
//   deleteAllDataFromDB,
// } = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

describe('Show Board', () => {
  // beforeAll(prepareDB);
  // afterEach(deleteAllDataFromDB);

  describe('show', () => {
    it('shows an Board', async () => {
      // Given
      const x = 0;
      const y = 0;
      const userId = 1;
      const Playing = new PlayingModel({
        x,
        y,
        userId,
      });
      // Playing.setInitParams();
      await Playing.save();

      // When
      const response = await chai.request(app)
        .get(`${basePath}/momii/playing`)
        .query({ x, y, userId });
      // Then
      expect({
        x,
        y,
        userId,
      }).toMatchObject({
        x: expect.any(Number),
        y: expect.any(Number),
        userId: expect.any(Number),
      });
    });

    it('return null when the user does not exist', async () => {
      // Given
      const x = 88888;
      const y = 88888;
      const userId = 88888;

      // When
      const response = await chai.request(app)
        .get(`${basePath}/momii/playing`)
        .query({ x, y, userId });
      // Then
      expect({
        x,
        y,
        userId,
      }).toMatchObject({});
    });
  });

  describe('create', () => {
    it('creates an user', async () => {
      // Given
      const x = 1;
      const y = 20;
      const userId = 3;

      // When
      const userMatcher = {
        x,
        y,
        userId,
      };

      const response = await chai.request(app)
        .post(`${basePath}/momii/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(userMatcher);

      // Then
      expect(response.body).toMatchObject({ status: 'success' });
      const playing = await PlayingModel.findOne({ x, y, userId });
      expect(playing).toMatchObject(userMatcher);
    });
  });
});
