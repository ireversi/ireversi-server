const chai = require('chai');
const app = require('../../../../../../src/routes/app.js');
const array2Pieces = require('./array2Pieces.js');
const { basePath } = require('./config.js');

module.exports = async (given) => {
  const pieces = array2Pieces(given);

  let response;
  for (let i = 0; i < pieces.length; i += 1) {
    response = await chai.request(app)
      .post(basePath)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(pieces[i]);
  }

  return response.body;
};
