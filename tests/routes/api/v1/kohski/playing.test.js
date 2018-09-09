const chai = require('chai');
const propFilter = '-_id -__v';

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/kohski/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';


function array2pieces(test_case){
  //check whether given 2d array is square or not
  let y_length = test_case.length;
  let x_length = 0;
  let square_length =0;
  test_case.forEach(element=>{
      temp_lebgth = element.length
      if(temp_lebgth>x_length){
          x_length=temp_lebgth;
      };
  });
  if(x_length!==y_length){
      return false;   //escape this function
  }else{
      square_length = x_length;　//adopt the square length
  }

  //clowring each elements
  let count=0;
  let temp_result = [];
  test_case.forEach(row => {
      row.forEach(column=>{
          if(typeof(column)==="object"){
              column.forEach(piece=>{
                  temp_result.push([count,piece]);
              });
          }else{
              temp_result.push([count,column]);
          };
          count++;
      });
  });

  //processing temp_result
  let result = [];
  temp_result.forEach(element=>{
      let index = Number(element[0]);
      let x = index%square_length; 
      let y = Math.floor(index/square_length);
      let piece = element[1];

      if(typeof(piece)==="string"){
          let userID = Number(piece.split(":")[0]);
          let turn  = Number(piece.split(":")[1]);
          let temp_obj = {"x":x,"y":y,"userID":userID,"turn":turn};
          result.push(temp_obj);
      }else if(typeof(piece)==="number" && piece !== 0){
          userID = piece;
          temp_obj = {"x":x,"y":y,"userID":userID};
          result.push(temp_obj);
      };
  });

  //sort temp_result by turn
  result.sort(function(a,b){
      if(a.turn<b.turn) return -1;
      if(a.turn > b.turn) return 1;
      return 0;
  });

  //delete property"turn"
  result.forEach(element =>{
      delete element.turn
  })
  return  result 
};

describe('play', () => {
  beforeAll(prepareDB);   //全てのテストをやる前に1回だけ呼ばれる。
  afterEach(deleteAllDataFromDB);

  // ここからtaskで作成したテスト
  describe('put piece', () => {
    it('puts a piece', async () => {
      // Given
      const piece = array2pieces(
        [
          ["1:1",0],
          [0,0]
        ]
      );
      const matchers = array2pieces(
        [
          [1,0],
          [0,0]
        ]
      );

      // When
      const response = await chai.request(app)
        .post(`${basePath}/kohski/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece[0]);

      // Then
      expect(response.body).toHaveLength(piece.length);
      expect(response.body).toMatchObject(matchers);

      const pieces = await PlayingModel.find({});
      expect(pieces).toHaveLength(piece.length);
      expect(pieces).toMatchObject(matchers);
    });
  });


  it('puts a piece', async () => {
    // Given
    const pieces = array2pieces(
      [
        ['1:1','2:2'],
        [0,0]
      ]
    );
    
    const matchers = array2pieces(
      [
        [1,2],
        [0,0]
      ]
    );

    // When
    let response;

    for(let i = 0; i<pieces.length; i+=1){
      response = await chai.request(app)
      .post(`${basePath}/kohski/playing`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(pieces[i]);
    }

    // Then　expressからの配列
    expect(response.body).toHaveLength(pieces.length);
    expect(response.body).toEqual(expect.arrayContaining(matchers));

    //mongodbの検証
    const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({},propFilter)));
    expect(pieceData).toHaveLength(pieces.length);
    expect(pieceData).toEqual(expect.arrayContaining(matchers));
  });

  //同じところに置けないテスト
  it('cannot be put on same place', async () => {
    // Given
    const pieces =array2pieces(
    [[["1:1","2:2"],0],
     ["3:3",0]]);


    const matchers = array2pieces(
      [
        [1,0],
        [3,0]
      ]
    );

    // When
    let response;

    for(let i = 0; i<pieces.length; i+=1){
      response = await chai.request(app)
      .post(`${basePath}/kohski/playing`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(pieces[i]);
    }

    // Then
    //左辺は現実、右辺は理想(=Matchers)
    //上はexpressの検証
    expect(response.body).toHaveLength(pieces.length-1);
    expect(response.body).toEqual(expect.arrayContaining(matchers));

    //mongodbの検証
    const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({},propFilter)));
    expect(pieceData).toHaveLength(pieces.length-1);
    expect(pieceData).toEqual(expect.arrayContaining(matchers));
  });

  //挟んだらめくれるテスト





  //はなれたところにおけないテスト
  //自分のがあったらめくれるところにしかおけない

});

