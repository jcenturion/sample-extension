var express  = require('express');
var app      = express();
var template = require('./views/index.jade');
var metadata = require('./webtask.json');

app.get('/', function (req, res) {
  res.header("Content-Type", 'text/html');
  res.status(200).send(template());
});

// This endpoint would be called by webtask-gallery to dicover your metadata
app.get('/meta', function (req, res) {
  res.status(200).send(metadata);
});

module.exports = app;
