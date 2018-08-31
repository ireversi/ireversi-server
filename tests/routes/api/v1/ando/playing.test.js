const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/ando/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

describe('Request pieces', () => {
  // beforeAll: ブロック間で一度だけ実行する事前処理
  beforeAll(prepareDB);
  // afterEach: テスト毎に実行する事後処理
  afterEach(deleteAllDataFromDB);

  describe('set', () => {
    it('set a piece', async () => {
      // Given
      const x = 0;
      const y = 0;
      const userId = 1;

      // When
      const playingMatcher = {
        x,
        y,
        userId,
      };

      const response = await chai.request(app)
        .post(`${basePath}/ando/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(playingMatcher);

      // Then
      expect(response.body).toMatchObject([
        {
          x: expect.any(Number),
          y: expect.any(Number),
          userId: expect.any(Number),
        },
      ]);
      const playing = await PlayingModel.findOne({ userId });
      expect(playing).toMatchObject(playingMatcher);
    });

    it('set two pieces', async () => {
      // Given
      const firstX = 0;
      const firstY = 0;
      const firstUserId = 1;

      const secondX = 1;
      const secondY = 0;
      const secondUserId = 2;

      // When
      const firstPlayingMatcher = {
        x: firstX,
        y: firstY,
        userId: firstUserId,
      };

      const secondPlayingMatcher = {
        x: secondX,
        y: secondY,
        userId: secondUserId,
      };

      await chai.request(app)
        .post(`${basePath}/ando/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(firstPlayingMatcher);

      const secondResponse = await chai.request(app)
        .post(`${basePath}/ando/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(secondPlayingMatcher);

      // Then
      expect(secondResponse.body).toMatchObject(
        [
          firstPlayingMatcher,
          secondPlayingMatcher,
        ],
      );
    });

    // it('set three pieces', async () => {
    //   // Given
    //   const firstX = 0;
    //   const firstY = 0;
    //   const firstUserId = 1;

    //   const secondX = 1;
    //   const secondY = 0;
    //   const secondUserId = 2;

    //   const thirdX = 2;
    //   const thirdY = 0;
    //   const thirdUserId = 1;

    //   // When
    //   const firstPlayingMatcher = {
    //     x: firstX,
    //     y: firstY,
    //     userId: firstUserId,
    //   };

    //   const secondPlayingMatcher = {
    //     x: secondX,
    //     y: secondY,
    //     userId: secondUserId,
    //   };

    //   const thirdPlayingMatcher = {
    //     x: thirdX,
    //     y: thirdY,
    //     userId: thirdUserId,
    //   };

    //   await chai.request(app)
    //     .post(`${basePath}/ando/playing`)
    //     .set('content-type', 'application/x-www-form-urlencoded')
    //     .send(firstPlayingMatcher);

    //   await chai.request(app)
    //     .post(`${basePath}/ando/playing`)
    //     .set('content-type', 'application/x-www-form-urlencoded')
    //     .send(secondPlayingMatcher);

    //   const thirdResponse = await chai.request(app)
    //     .post(`${basePath}/ando/playing`)
    //     .set('content-type', 'application/x-www-form-urlencoded')
    //     .send(thirdPlayingMatcher);

    //   // Then
    //   expect(thirdResponse.body).toMatchObject(
    //     [
    //       firstPlayingMatcher,
    //       {
    //         x: secondPlayingMatcher.x,
    //         y: secondPlayingMatcher.y,
    //         userId: thirdPlayingMatcher.userId,
    //       },
    //       thirdPlayingMatcher,
    //     ],
    //   );
    // });
  });
});
