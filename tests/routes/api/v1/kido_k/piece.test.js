const chai = require('chai');
const propfilter = '-_id -__v';
// module.exports = () => {

// }
// common js

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

  it('put a piece', async () => {
    // Given
    const pieces = [ // pieces = [x,y,userid]
      [0, 0, 1],
    ];

    const result = {
      size: 2,    //set width of bord
      bord: [     //set correct answer
        1, 0,
        0, 0
      ]
    };

    // When
    var response;
    for (var i = 0; i < pieces.length; i++) {
      const piece = convertPiece(pieces[i]);
      response = await chai.request(app)
        .post(`${basePath}/kido_k/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);
    }

    // Then
    const rpieces = convertComparisonResult(result);
    expect(response.body).toHaveLength(rpieces.length);
    expect(response.body).toEqual(expect.arrayContaining(rpieces));

    const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    expect(pieceData).toHaveLength(rpieces.length);
    expect(pieceData).toEqual(expect.arrayContaining(rpieces));
  });


  it('sets multi pieces', async () => {
    // Given
    const pieces = [ // pieces = [x,y,userid]
      [0, 0, 1],
      [1, 0, 2]
    ];

    const result = {
      size: 2,    //set width of bord
      bord: [     //set correct answer
        1, 2,
        0, 0
      ]
    };

    // When
    var response;
    for (var i = 0; i < pieces.length; i++) {
      const piece = convertPiece(pieces[i]);
      response = await chai.request(app)
        .post(`${basePath}/kido_k/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);
    }

    // Then
    const rpieces = convertComparisonResult(result);
    expect(response.body).toHaveLength(rpieces.length);
    expect(response.body).toEqual(expect.arrayContaining(rpieces));

    const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    expect(pieceData).toHaveLength(rpieces.length);
    expect(pieceData).toEqual(expect.arrayContaining(rpieces));
  });

  //同じとFころにおけないテスト
  it('sets pieces same space', async () => {
    // Given
    const pieces = [ // pieces = [x,y,userid]
      [0, 0, 1],
      [1, 0, 2],
      [1, 0, 1]
    ];

    const result = {
      size: 2,    //set width of bord
      bord: [     //set correct answer
        1, 2,
        0, 0
      ]
    };

    // When
    for (var i = 0; i < pieces.length; i++) {
      const piece = convertPiece(pieces[i]);
      response = await chai.request(app)
        .post(`${basePath}/kido_k/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);
    }

    // Then
    //check express result
    const rpieces = convertComparisonResult(result);
    expect(response.body).toHaveLength(rpieces.length);
    expect(response.body).toEqual(expect.arrayContaining(rpieces));

    //check mongoDB result
    const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    expect(pieceData).toHaveLength(rpieces.length);
    expect(pieceData).toEqual(expect.arrayContaining(rpieces));

  });


  //挟んだらめくれるテスト
  it('sets pieces same space', async () => {
    // Given

    const pieces = [
      {
        x: 0,
        y: 0,
        userid: 1,
      },
      {
        x: 0,
        y: 0,
        userid: 2,
      },
      {
        x: 1,
        y: 0,
        userid: 3,
      },
    ];

    // When
    const pieceMatcher1 = {
      x: 0,
      y: 0,
      userid: 1,
    };
    const pieceMatcher2 = {
      x: 1,
      y: 0,
      userid: 3,
    };

    var response;
    for (var i = 0; i < pieces.length; i++) {
      response = await chai.request(app)
        .post(`${basePath}/kido_k/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(pieces.length - 1);
    expect(response.body[0]).toMatchObject(pieceMatcher1);
    expect(response.body[1]).toMatchObject(pieceMatcher2);

    const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    expect(pieceData).toHaveLength(pieces.length - 1);
    expect(response.body[0]).toMatchObject(pieceMatcher1);
    expect(response.body[1]).toMatchObject(pieceMatcher2);

  });

});

function convertPiece(piece) {
  var convert = { x: piece[0], y: piece[1], userid: piece[2] }
  return convert;
}

function convertComparisonResult(result) {
  // var count = 0;
  const pieces = [];
  const bsize = result.size;
  const bpieces = result.bord;
  for (var i = 0; i < bpieces.length; i++) {
    if (bpieces[i] !== 0) {
      const piece = {
        x: Math.floor(i % bsize),
        y: Math.floor(i / bsize),
        userid: bpieces[i]
      }
      pieces.push(piece);
    }
  }
  return pieces;
}