const chai = require('chai');
// const jwt = require('jsonwebtoken');
const app = require('../../../../../src/routes/app.js');
// const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const generateToken = require('../../../../../src/routes/api/v2/userIdGenerate/generateToken');

const basePath = '/api/v2';

function userIdGenerate() {
  const token = generateToken.generate();
  return token;
}

describe('userId generate', () => {
  // 一つ駒を置く
  it('generates userId and request userName', async () => {
    // Given
    const userIdJwt = userIdGenerate();
    const username = 'testuser';

    // When
    const response = await chai.request(app)
      .post(`${basePath}/user_id_generate`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ username });
      // Then
    expect(response.body.accessToken.length).toEqual(userIdJwt.length);
  });


  it('generates userId and request invalid userName', async () => {
    // Given
    const username = 'test-kimkim';

    // When
    const response = await chai.request(app)
      .post(`${basePath}/user_id_generate`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ username });
      // Then
    expect(response.body.accessToken).toEqual(null);
    expect(response.body.userId).toEqual(null);
    expect(response.body.username).toEqual(null);
  });
});
