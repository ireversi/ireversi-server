const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use('/api/v1', require('./api/v1/index.js'));

module.exports = app;
