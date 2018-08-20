const Hashids = require('hashids');

module.exports = length => (new Hashids('', length)).encode(`${Date.now()}`).slice(-length).toLowerCase();
