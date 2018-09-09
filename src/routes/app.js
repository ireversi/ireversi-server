const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use('/api/v1', require('./api/v1/index.js')); // .../api/v1にマッチしたら requireしてくるよって意味

module.exports = app;
