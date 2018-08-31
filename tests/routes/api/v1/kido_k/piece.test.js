const chai = require('chai');
// module.exports = () => {

// }
//common js

// import chai from 'chai';
// export default () => {

// };
// ES6 import

const app = require('../../../../../src/routes/app.js');
const PieceModel = require('../../../../../src/models/kido_k/PieceModel.js');
const {
    prepareDB,
    deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

describe('play', () => {
    beforeAll(prepareDB);
    afterEach(deleteAllDataFromDB);

    describe('put a piece', () => {
        it('puts a piece', async () => {

            // Given new
            const x = 0;
            const y = 0;
            const user_id = 1;
            const Piece = new PieceModel({
                x,
                y,
                user_id
            });
            await Piece.save();

            // When
            const response = await chai.request(app)
                .get(`${basePath}/kido_k/piece`)
                .query({ user_id });

            // Then
            expect(response.body).toMatchObject({
                x,
                y,
                user_id,
            });
        });

        it('return null when the user does not exist', async () => {
            // Given
            const user_id = 1;

            // When
            const response = await chai.request(app)
                .get(`${basePath}/kido_k/piece`)
                .query({ user_id });

            // Then
            expect(response.body).toBe(null);
        });
    });

    describe('create', () => {
        it('creates an user', async () => {
            // Given
            const x = 0;
            const y = 0;
            const user_id = 1;

            // When
            const pieceMatcher = {
                x,
                y,
                user_id,
            };

            const response = await chai.request(app)
                .post(`${basePath}/kido_k/piece`)
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(pieceMatcher);

            // Then
            // expect(response.body).toHaveLength(1);

            expect(response.body).toMatchObject({ status: 'success' });
            const piece = await PieceModel.findOne({ user_id });
            expect(piece).toMatchObject(pieceMatcher);
        });
    });
});
