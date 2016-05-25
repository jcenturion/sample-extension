var express  = require('express');
var app      = express();
var template = require('./views/index.jade');
var metadata = require('./webtask.json');
var auth0    = require('auth0-oauth2-express');
var Request  = require('superagent');
var Auth0    = require('auth0');
var _        = require('lodash');
var jwt      = require('jsonwebtoken');
var hooks    = express.Router();

// Getting Auth0 APIV2 access_token
hooks.use(function (req, res, next) {
  getToken(req, function (access_token, err) {
    if (err) return next(err);

    var auth0 = new Auth0.ManagementClient({
      domain: req.webtaskContext.data.AUTH0_DOMAIN,
      token: access_token
    });

    req.auth0 = auth0;

    next();
  });
});

// This endpoint would be called by webtask-gallery
hooks.post('/on-install', function (req, res) {
  req.auth0.rules.create({
    name: 'extension-rule',
    script: "function (user, context, callback) {\n  callback(null, user, context);\n}",
    order: 2,
    enabled: true,
    stage: "login_success"
  })
  .then(function () {
    res.sendStatus(204);
  })
  .catch(function () {
    res.sendStatus(500);
  });
});

// This endpoint would be called by webtask-gallery
hooks.delete('/on-uninstall', function (req, res) {
  req.auth0
    .rules.getAll(function (rules) {
      var rule = _.find(rules, {name: 'extension-rule'});

      if (rule) {
        req.auth0
          .rules.delete({ id: rule.id })
          .then(function () {
            res.sendStatus(204);
          })
          .catch(function () {
            res.sendStatus(500);
          });
      }
    })
    .catch(function () {
      res.sendStatus(500);
    });
});

app.use('/.extensions', hooks);

app.use(function (req, res, next) {
  auth0({
    scopes:              req.webtaskContext.data.AUTH0_SCOPES,
    clientId:            req.webtaskContext.data.AUTH0_CLIENT_ID,
    rootTenantAuthority: 'https://' + req.webtaskContext.data.AUTH0_DOMAIN
  })(req, res, next)
});

app.get('/', function (req, res) {
  res.header("Content-Type", 'text/html');
  res.status(200).send(template({
    baseUrl: res.locals.baseUrl,
    domain: 'https://' + req.webtaskContext.data.AUTH0_DOMAIN
  }));
});

// This endpoint would be called by webtask-gallery to dicover your metadata
app.get('/meta', function (req, res) {
  res.status(200).send(metadata);
});

// Validate JWT
app.use('/.extensions', function (req, res, next) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    var token   = req.headers.authorization.split(' ')[1];
    var isValid = jwt.verify(token, req.webtaskContext.data.EXTENSION_SECRET, {
      audience: req.webtaskContext.data.AUTH0_CLIENT_ID,
      issuer: 'https://' + req.webtaskContext.data.AUTH0_DOMAIN
    });

    if (!isValid) {
      return res.sendStatus(401);
    }

    next();
  }
});

function getToken(req, cb) {
  var apiUrl = 'https://'+req.webtaskContext.data.AUTH0_DOMAIN+'/oauth/token';
  var audience = 'https://'+req.webtaskContext.data.AUTH0_DOMAIN+'/api/v2/';
  var clientId = req.webtaskContext.data.AUTH0_CLIENT_ID;
  var clientSecret = req.webtaskContext.data.AUTH0_CLIENT_SECRET;

  Request
    .post(apiUrl)
    .send({
      audience: audience,
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
    .type('application/json')
    .end(function (err, res) {
      if (err || !res.ok) {
        cb(null, err);
      } else {
        cb(res.body.access_token);
      }
    });
}

module.exports = app;
