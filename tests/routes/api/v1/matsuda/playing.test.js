const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/matsuda/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

describe('Request users', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('play', () => {
    it('sets first piece', async () => {
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
        .post(`${basePath}/matsuda/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(playingMatcher);

      // Then
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(playingMatcher);

      const allPiece = await PlayingModel.find({});
      expect(allPiece).toHaveLength(1);
      expect(allPiece[0]).toMatchObject(playingMatcher);
    });

    it('sets multi pieces', async () => {
      // Given
      const pieces = [
        {
          x: 0,
          y: 0,
          userId: 1,
        },
        {
          x: 1,
          y: 0,
          userId: 3,
        },
        {
          x: 2,
          y: 0,
          userId: 2,
        },
      ];

      for (let i = 0; i < pieces.length; i += 1) {
        // When
        const playingMatcher = pieces[i];

        const response = await chai.request(app)
          .post(`${basePath}/matsuda/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(playingMatcher);

        // Then
        expect(response.body).toHaveLength(i + 1);
        expect(response.body[i]).toMatchObject(playingMatcher);

        const allPiece = await PlayingModel.find({});
        expect(allPiece).toHaveLength(i + 1);
        expect(allPiece[i]).toMatchObject(playingMatcher);
      }
    });

    it('cannot set same place', async () => {
      // Given
      const pieces = [
        {
          x: 0,
          y: 0,
          userId: 1,
        },
        {
          x: 1,
          y: 0,
          userId: 3,
        },
        {
          x: 0,
          y: 0,
          userId: 2,
        },
      ];

      let response;

      // When
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/matsuda/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      const playingMatcher = pieces[0];
      expect(response.body).toHaveLength(pieces.length - 1);
      expect(response.body[0]).toMatchObject(playingMatcher);

      const allPiece = await PlayingModel.find({});
      expect(allPiece).toHaveLength(pieces.length - 1);
      expect(allPiece[0]).toMatchObject(playingMatcher);
    });

    it('turns sandwiched pieces', async () => {
      // Given
      const pieces = [
        {
          x: 0,
          y: 0,
          userId: 1,
        },
        {
          x: 1,
          y: 1,
          userId: 3,
        },
        {
          x: 2,
          y: 2,
          userId: 2,
        },
        {
          x: 3,
          y: 3,
          userId: 1,
        },
      ];

      let response;

      // When
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/matsuda/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      const allPiece = await PlayingModel.find({});
      expect(allPiece).toHaveLength(pieces.length);
      expect(response.body).toHaveLength(pieces.length);

      for (let i = 0; i < pieces.length; i += 1) {
        const playingMatcher = {
          ...pieces[i],
          userId: 1,
        };

        expect(response.body[i]).toMatchObject(playingMatcher);
        expect(allPiece[i]).toMatchObject(playingMatcher);
      }
    });
  });
});
