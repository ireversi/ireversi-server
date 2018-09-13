const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/fujii/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';
const propfilter = '-_id -__v';


function reformPiece(d) {
  const arry = [...Array(d.length).fill(0)];
  const r = Math.sqrt(d.length);
  let obj;
  let order;
  for (let i = 0; i < d.length; i += 1) {
    if (d[i] !== 0 && !Array.isArray(d[i])) {
      obj = {
        x: i % r,
        y: r - Math.floor(i / r) - 1,
        userId: +d[i].split(':')[0],
      };
      order = +d[i].split(':')[1] - 1;
      arry.splice(order, 1, obj);
    } else if (d[i] !== 0 && Array.isArray(d[i])) { // 配列が入っている場合 = 同じ手がある場合
      obj = {
        x: i % r,
        y: r - Math.floor(i / r) - 1,
        userId: +d[i][0].split(':')[0],
      };
      order = +d[i][0].split(':')[1] - 1;
      arry.splice(order, 1, obj);
    }
  }
  const newArray = arry.filter(el => el !== 0);
  return newArray;
}

function reformMatchers(m) {
  const arry = [];
  const r = Math.sqrt(m.length);
  for (let i = 0; i < m.length; i += 1) {
    if (!(m[i] === 0)) {
      const obj = {
        x: i % r,
        y: r - Math.floor(i / r) - 1,
        userId: +m[i],
      };
      arry.push(obj);
    }
  }
  return arry;
}


describe('play', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  // ---------------
  // 駒を置くテスト
  // ---------------

  describe('put piece', () => {
    it('puts piece(s)', async () => {
      const piece = [
        '3:4', '4:3',
        '1:1', '2:2',
      ];

      const matchers = [
        3, 4,
        1, 2,
      ];

      // When
      let response;
      const rPiece = reformPiece(piece);
      for (let i = 0; i < rPiece.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/fujii/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(rPiece[i]);
      }
      // Then
      const rMatchers = reformMatchers(matchers);
      expect(response.body).toHaveLength(rMatchers.length);
      expect(response.body).toEqual(expect.arrayContaining(rMatchers));

      const pieces = JSON.parse(JSON.stringify(await PlayingModel.find({}, propfilter)));
      expect(pieces).toHaveLength(rMatchers.length);
      expect(pieces).toEqual(expect.arrayContaining(rMatchers));
    });

    // ---------------
    // 同じ場所に置けないテスト
    // ---------------

    it('puts on same the place', async () => {
      const piece = [
        '3:4', ['4:3', '5:5'],
        '1:1', '2:2',
      ];

      const matchers = [
        3, 4,
        1, 2,
      ];

      // When
      let response;
      const rPiece = reformPiece(piece);
      // console.log(rPiece);
      for (let i = 0; i < rPiece.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/fujii/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(rPiece[i]);
      }

      // // Then
      const rMatchers = reformMatchers(matchers);
      expect(response.body).toHaveLength(rMatchers.length);
      expect(response.body).toEqual(expect.arrayContaining(rMatchers));

      const pieces = JSON.parse(JSON.stringify(await PlayingModel.find({}, propfilter)));
      // console.log(pieces);
      expect(pieces).toHaveLength(rMatchers.length);
      expect(pieces).toEqual(expect.arrayContaining(rMatchers));
    });


    // ---------------
    // 挟んでめくるテスト
    // ---------------

    it('puts a piece and flips ones', async () => {
      const piece = [
        '1:5', 0, 0,
        '3:4', '4:3', 0,
        '1:1', '2:2', 0,
      ];

      const matchers = [
        1, 0, 0,
        1, 4, 0,
        1, 2, 0,
      ];

      // When
      let response;
      const rPiece = reformPiece(piece);
      // console.log(rPiece);
      for (let i = 0; i < rPiece.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/fujii/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(rPiece[i]);
      }

      // // Then
      const rMatchers = reformMatchers(matchers);
      expect(response.body).toHaveLength(rMatchers.length);
      expect(response.body).toEqual(expect.arrayContaining(rMatchers));

      const pieces = JSON.parse(JSON.stringify(await PlayingModel.find({}, propfilter)));
      expect(pieces).toHaveLength(rMatchers.length);
      expect(pieces).toEqual(expect.arrayContaining(rMatchers));
    });

    // ---------------
    // 自分の駒が場にないときは、誰かの上下左右にしか置けない機能
    // ---------------
    it('no my piece and put a piece', async () => {
      const piece = [
        '1:5', 0, '5:7',
        '3:4', '4:3', 0,
        '1:1', '2:2', 0,
      ];

      const matchers = [
        1, 0, 0,
        1, 4, 0,
        1, 2, 0,
      ];

      // When
      let response;
      const rPiece = reformPiece(piece);
      for (let i = 0; i < rPiece.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/fujii/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(rPiece[i]);
      }

      // // Then
      const rMatchers = reformMatchers(matchers);
      expect(response.body).toHaveLength(rMatchers.length);
      expect(response.body).toEqual(expect.arrayContaining(rMatchers));

      const pieces = JSON.parse(JSON.stringify(await PlayingModel.find({}, propfilter)));
      expect(pieces).toHaveLength(rMatchers.length);
      expect(pieces).toEqual(expect.arrayContaining(rMatchers));
    });

    // ---------------
    // 自分の駒がある場合、めくれる場所にのみ置ける
    // ---------------
    it('can put on specific places', async () => {
      const piece = [
        0, 0, 0,
        0, 0, '1:3',
        '1:1', '2:2', 0,
      ];

      const matchers = [
        0, 0, 0,
        0, 0, 0,
        1, 2, 0,
      ];

      // When
      let response;
      const rPiece = reformPiece(piece);
      for (let i = 0; i < rPiece.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/fujii/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(rPiece[i]);
      }

      // Then
      const rMatchers = reformMatchers(matchers);
      expect(response.body).toHaveLength(rMatchers.length);
      expect(response.body).toEqual(expect.arrayContaining(rMatchers));

      const pieces = JSON.parse(JSON.stringify(await PlayingModel.find({}, propfilter)));
      expect(pieces).toHaveLength(rMatchers.length);
      expect(pieces).toEqual(expect.arrayContaining(rMatchers));
    });
  });
});
