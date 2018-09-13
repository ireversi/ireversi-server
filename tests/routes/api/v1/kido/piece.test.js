
const chai = require('chai');

const ZERO0 = 0;
const propfilter = '-_id -__v';

const app = require('../../../../../src/routes/app.js');
const PieceModel = require('../../../../../src/models/kido/PieceModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

function convert2PieceRecord(pieces) {
  const record = [];
  for (let i = 0; i < pieces.length; i += 1) {
    const size = Math.sqrt(pieces.length);
    const piece = pieces[i];
    if (piece !== 0 && !Array.isArray(piece)) {
      const point = piece.indexOf(':');
      const num = piece.slice(0, point);
      const userid = piece.slice(point + 1);
      const x = Math.floor(i % size);
      const y = Math.floor(i / size);
      record.push([num, x, y, userid]);
    } else if (piece !== 0 && Array.isArray(piece)) {
      for (let j = 0; j < piece.length; j += 1) {
        const pie = piece[j];
        const point = pie.indexOf(':');
        const num = pie.slice(0, point);
        const userid = pie.slice(point + 1);
        const x = Math.floor(i % size);
        const y = Math.floor(i / size);
        record.push([num, x, y, userid]);
      }
    }
  }
  record.sort((a, b) => {
    if (+a[0] < +b[0]) return -1;
    if (+a[0] > +b[0]) return 1;
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
  const size = Math.sqrt(result.length);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0) {
      const piece = {
        x: Math.floor(i % size),
        y: Math.floor(i / size),
        userid: result[i],
      };
      pieces.push(piece);
    }
  }
  return pieces;
}


describe('play', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('put a piece', async () => {
    // Given
    const pieces = [
      ZERO0, ZERO0,
      '1:1', ZERO0,
    ];

    const result = [
      0, 0,
      1, 0,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // 複数駒を置く
  it('sets multi pieces', async () => {
    // Given
    const pieces = [
      '1:1', '2:2',
      ZERO0, ZERO0,
    ];

    const result = [
      1, 2,
      0, 0,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);
    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // 同じところにおけないテスト
  it('sets pieces same space', async () => {
    // Given
    const pieces = [
      '1:1', ['2:2', '3:1'],
      ZERO0, ZERO0,
    ];

    const result = [
      1, 2,
      0, 0,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);
    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // 挟んだらめくれるテスト（左方向、上方向） part1
  it('turn over piece about left and up', async () => {
    // Given
    const pieces = [
      '1:1', '2:2', '3:1',
      '4:2', ZERO0, ZERO0,
      '5:1', ZERO0, ZERO0,
    ];

    const result = [
      1, 1, 1,
      1, 0, 0,
      1, 0, 0,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // 挟んだらめくれるテスト part2（右方向、下方向）
  it('turn over piece about left and up', async () => {
    // Given
    const pieces = [
      ZERO0, ZERO0, '5:1',
      ZERO0, ZERO0, '4:2',
      '3:1', '2:2', '1:1',
    ];

    const result = [
      0, 0, 1,
      0, 0, 1,
      1, 1, 1,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // 挟んだらめくれるテスト part3
  it('turn over piece about upper left and lower left', async () => {
    // Given
    const pieces = [
      ZERO0, ZERO0, '4:1', ZERO0,
      ZERO0, '3:3', ZERO0, ZERO0,
      '1:1', '2:2', '5:3', ZERO0,
      ZERO0, ZERO0, ZERO0, '6:1',
    ];

    const result = [
      0, 0, 1, 0,
      0, 1, 0, 0,
      1, 2, 1, 0,
      0, 0, 0, 1,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // // 挟んだらめくれるテスト part4
  it('turn over piece about upper right and lower right', async () => {
    // Given
    const pieces = [
      ZERO0, '4:1', ZERO0, ZERO0,
      ZERO0, ZERO0, '3:3', ZERO0,
      ZERO0, '5:3', '2:2', '1:1',
      '6:1', ZERO0, ZERO0, ZERO0,
    ];

    const result = [
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 1, 2, 1,
      1, 0, 0, 0,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // 場に一枚も置いてない場合の駒置きテスト（反転無し） part1
  it('in the case about nothing own piece, not turn over', async () => {
    // Given
    const pieces = [
      ZERO0, '2:2', ZERO0, ZERO0,
      ZERO0, '1:1', '4:1', ZERO0,
      ZERO0, '3:3', ZERO0, ZERO0,
      ZERO0, ZERO0, '5:4', ZERO0,
    ];

    const result = [
      0, 2, 0, 0,
      0, 1, 0, 0,
      0, 3, 0, 0,
      0, 0, 0, 0,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // 場に一枚も置いてない場合の駒置きテスト（反転有り） part2
  it('the case about nothing own piece, to turn over', async () => {
    // Given
    const pieces = [
      ZERO0, '2:2', ZERO0, ZERO0,
      ZERO0, '1:1', '5:2', ZERO0,
      ZERO0, '3:3', ZERO0, ZERO0,
      ZERO0, '4:1', '6:3', ZERO0,
    ];

    const result = [
      0, 2, 0, 0,
      0, 1, 0, 0,
      0, 1, 0, 0,
      0, 1, 3, 0,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // // 場に駒がある場合の駒置きテスト（上下左右チェック） part1
  it('the case about exist own piece, check to turn over four direction', async () => {
    // Given
    const pieces = [
      '20:1', '21:1', '5:1', '6:1', '7:1',
      '19:1', ZERO0, '2:2', ZERO0, '8:1',
      '18:1', '17:5', '1:1', '3:3', '9:1',
      '16:1', ZERO0, '4:4', ZERO0, '10:1',
      '15:1', '14:1', '13:1', '12:1', '11:1',
    ];

    const result = [
      0, 0, 1, 0, 0,
      0, 0, 1, 0, 0,
      1, 1, 1, 1, 1,
      0, 0, 1, 0, 0,
      0, 0, 1, 0, 0,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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

  // 場に駒がある場合の駒置きテスト（斜めの4方向チェック） part2
  it('the case about exist own piece, check to turn over four direction', async () => {
    // Given
    const pieces = [
      '18:1', ZERO0, ZERO0, ZERO0, '10:1',
      ZERO0, '9:9', '2:2', '6:6', '11:1',
      '17:1', '5:5', '1:1', '3:3', '12:1',
      '16:1', '8:8', '4:4', '7:7', '13:1',
      '15:1', ZERO0, ZERO0, ZERO0, '14:1',
    ];

    const result = [
      1, 0, 0, 0, 1,
      0, 1, 2, 1, 0,
      1, 1, 1, 1, 1,
      0, 1, 4, 1, 0,
      1, 0, 0, 0, 1,
    ];

    // When
    let response;
    const record = convert2PieceRecord(pieces);

    for (let i = 0; i < record.length; i += 1) {
      let piece = record[i];
      piece = convertPiece(piece);
      response = await chai.request(app)
        .post(`${basePath}/kido/piece`)
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
