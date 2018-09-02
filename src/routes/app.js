const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: false }));//use:他のモジュールから飛んでくる情報をparseする
app.use('/api/v1', require('./api/v1/index.js')); //指定したURLがマッチしたら、index.jsに投げる

module.exports = app;
