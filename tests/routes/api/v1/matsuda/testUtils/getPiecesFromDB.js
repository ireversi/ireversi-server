const PlayingModel = require('../../../../../../src/models/matsuda/PlayingModel.js');

const propFilter = '-_id -__v';
module.exports = async () => JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter).exec()));
