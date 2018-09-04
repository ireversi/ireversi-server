const PlayingModel = require('../../../../../../src/models/matsuda/PlayingModel.js');

const propFilter = '-_id -__v';
// eslint-disable-next-line max-len
module.exports = async () => JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter).exec()));
