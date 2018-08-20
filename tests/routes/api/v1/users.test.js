const chai = require('chai');

const app = require('../../../../src/routes/app.js');
const UserModel = require('../../../../src/models/UserModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../src/utils/db.js');

const basePath = '/api/v1';

describe('Request users', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('show', () => {
    it('shows an user', async () => {
      // Given
      const name = 'mario';
      const email = 'test@example.com';
      const password = 'password';
      const User = new UserModel();
      User.setInitParams();
      User.name = name;
      User.email = email;
      User.password = password;
      await User.save();

      // When
      const response = await chai.request(app)
        .get(`${basePath}/users`)
        .query({ name });

      // Then
      expect(response.body).toMatchObject({
        user_id: expect.any(String),
        name,
        email,
        password,
        created: expect.any(String),
      });
    });

    it('return null when the user does not exist', async () => {
      // Given
      const name = 'mario';

      // When
      const response = await chai.request(app)
        .get(`${basePath}/users`)
        .query({ name });

      // Then
      expect(response.body).toBe(null);
    });
  });

  describe('create', () => {
    it('creates an user', async () => {
      // Given
      const name = 'mario';
      const email = 'test@example.com';
      const password = 'password';

      // When
      const userMatcher = {
        name,
        email,
        password,
      };

      const response = await chai.request(app)
        .post(`${basePath}/users`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(userMatcher);

      // Then
      expect(response.body).toMatchObject({ status: 'success' });
      const user = await UserModel.findOne({ name });
      expect(user).toMatchObject(userMatcher);
    });
  });
});
