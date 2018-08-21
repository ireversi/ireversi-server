const Hashids = require('hashids');

module.exports = length => (new Hashids('', length)).encode(`${Math.random()}`.split('.')[1]).slice(-length).toLowerCase();
