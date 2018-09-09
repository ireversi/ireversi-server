const chai = require('chai');
// module.exports = () => {

// };
// common js

// import chai from 'chai';
// export default () => {

// };
// ES6 import

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
      const User = new UserModel({
        name,
        email,
        password,
      });
      User.setInitParams();
      await User.save();

      // When
      const response = await chai.request(app)
        .get(`${basePath}/users`) // ajaxで取りに行ってる
        .query({ name }); // 指定URLの設定

      // Then
      expect(response.body).toMatchObject({ // Objectにマッチするかチェック
        user_id: expect.any(String), // 文字列w期待
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