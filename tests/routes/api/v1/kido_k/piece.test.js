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

function convert2PieceRecord(pieces) {
  const record = [];
  for (let i = 0; i < pieces.record.length; i += 1) {
    const piece = pieces.record[i];
    if (piece !== 0 && !Array.isArray(piece)) {
      const point = piece.indexOf(':');
      const num = piece.slice(0, point);
      const userid = piece.slice(point + 1);
      const x = Math.floor(i % pieces.size);
      const y = Math.floor(i / pieces.size);
      record.push([num, x, y, userid]);
    } else if (piece !== 0 && Array.isArray(piece)) {
      for (let j = 0; j < piece.length; j += 1) {
        const pie = piece[j];
        const point = pie.indexOf(':');
        const num = pie.slice(0, point);
        const userid = pie.slice(point + 1);
        const x = Math.floor(i % pieces.size);
        const y = Math.floor(i / pieces.size);
        record.push([num, x, y, userid]);
      }
    }
  }
  record.sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  return record;
}

function convertPiece(piece) {
  const convert = { x: piece[1], y: piece[2], userid: piece[3] };
  return convert;
}

function convertComparisonResult(result) {
  const pieces = [];
  const bsize = result.size;
  const bpieces = result.bord;
  for (let i = 0; i < bpieces.length; i += 1) {
    if (bpieces[i] !== 0) {
      const piece = {
        x: Math.floor(i % bsize),
        y: Math.floor(i / bsize),
        userid: bpieces[i],
      };
      pieces.push(piece);
    }
  }
  return pieces;
}


describe('play', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  it('put a piece', async () => {
    // Given
    const pieces = { // pieces = [x,y,userid]
      size: 2, // set width of bord
      record: [
        0, 0,
        '1:1', 0,
      ],
    };

    const result = {
      size: 2, // set width of bord
      bord: [ // set correct answer
        0, 0,
        1, 0,
      ],
    };

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
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
    const pieces = {
      size: 2, // set width of record
      record: [
        '1:1', '2:2',
        0, 0,
      ],
    };

    const result = {
      size: 2, // set width of bord
      bord: [ // set correct answer
        1, 2,
        0, 0,
      ],
    };

    // When
    let response;
    const record = convert2PieceRecord(pieces);
    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
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

  // 同じとFころにおけないテスト
  it('sets pieces same space', async () => {
    // Given
    const pieces = {
      size: 2, // set width of record
      record: [
        '1:1', ['2:2', '3:1'],
        0, 0,
      ],
    };

    const result = {
      size: 2, // set width of bord
      bord: [ // set correct answer
        1, 2,
        0, 0,
      ],
    };

    //   // When
    let response;
    const record = convert2PieceRecord(pieces);
    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido_k/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);
    }

    // Then
    // check express result
    const rpieces = convertComparisonResult(result);
    expect(response.body).toHaveLength(rpieces.length);
    expect(response.body).toEqual(expect.arrayContaining(rpieces));

    // check mongoDB result
    const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    expect(pieceData).toHaveLength(rpieces.length);
    expect(pieceData).toEqual(expect.arrayContaining(rpieces));
  });

  // 挟んだらめくれるテスト part1
  it('turn over piece about right and down', async () => {
    // Given
    const pieces = {
      size: 3, // set width of record
      record: [
        '1:1', '2:2', '3:1',
        '4:2', 0, 0,
        '5:1', 0, 0,
      ],
    };

    const result = {
      size: 3, // set width of bord
      bord: [ // set correct answer
        1, 1, 1,
        1, 0, 0,
        1, 0, 0,
      ],
    };

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido_k/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);
    }

    // Then
    // check express result
    const rpieces = convertComparisonResult(result);
    expect(response.body).toHaveLength(rpieces.length);
    expect(response.body).toEqual(expect.arrayContaining(rpieces));

    // check mongoDB result
    const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    expect(pieceData).toHaveLength(rpieces.length);
    expect(pieceData).toEqual(expect.arrayContaining(rpieces));
  });

  // // 挟んだらめくれるテスト part2
  it('turn over piece about left and up', async () => {
    // Given
    const pieces = {
      size: 3, // set width of record
      record: [
        0, 0, '5:1',
        0, 0, '4:2',
        '3:1', '2:2', '1:1',
      ],
    };

    const result = {
      size: 3, // set width of bord
      bord: [ // set correct answer
        0, 0, 1,
        0, 0, 1,
        1, 1, 1,
      ],
    };

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido_k/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);
    }

    // Then
    // check express result
    const rpieces = convertComparisonResult(result);
    expect(response.body).toHaveLength(rpieces.length);
    expect(response.body).toEqual(expect.arrayContaining(rpieces));

    // check mongoDB result
    const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    expect(pieceData).toHaveLength(rpieces.length);
    expect(pieceData).toEqual(expect.arrayContaining(rpieces));
  });
});
