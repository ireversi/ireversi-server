const PlayingModel = require('../../../../../../src/models/matsuda/PlayingModel.js');
const array2Matchers = require('./array2Matchers.js');

module.exports = array => Promise.all(array2Matchers(array).map(d => new PlayingModel(d).save()));
