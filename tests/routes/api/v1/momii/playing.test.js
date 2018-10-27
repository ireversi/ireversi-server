const chai = require('chai');

const app = require('../../../../../src/routes/app');
const PlayingModel = require('../../../../../src/models/momii/PlayingModel.js');

const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

describe('Play', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  it('pust a piece', async () => {
    // given
    const piece = {
      x: 0,
      y: 0,
      userId: 1,
    };

    // when
    const response = await chai.request(app)
      .post(`${basePath}/momii/playing`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(piece);

    // then
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject(piece);

    const pieces = await PlayingModel.find({}, '-_id -__v').lean();
    expect(pieces).toHaveLength(1);
    expect(pieces[0]).toMatchObject(piece);
  });
});
