const PlayingModel = require('../../../../../../src/models/matsuda/PlayingModel.js');

const propFilter = '-_id -__v';
module.exports = () => PlayingModel.find({}, propFilter).lean();
