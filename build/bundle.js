module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!********************!*\
  !*** ./webtask.js ***!
  \********************/
/***/ function(module, exports, __webpack_require__) {

	var Webtask = __webpack_require__(/*! webtask-tools */ 2);
	
	// This is the entry-point for the Webpack build. We need to convert our module
	// (which is a simple Express server) into a Webtask-compatible function.
	module.exports = Webtask.fromExpress(__webpack_require__(/*! ./index.js */ 5));


/***/ },
/* 1 */,
/* 2 */
/*!**********************************!*\
  !*** ./~/webtask-tools/index.js ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	exports.fromConnect = exports.fromExpress = fromConnect;
	exports.fromHapi = fromHapi;
	exports.fromServer = exports.fromRestify = fromServer;
	
	
	// API functions
	
	function fromConnect (connectFn) {
	    return function (context, req, res) {
	        var normalizeRouteRx = createRouteNormalizationRx(req.x_wt.jtn);
	
	        req.originalUrl = req.url;
	        req.url = req.url.replace(normalizeRouteRx, '/');
	        req.webtaskContext = attachStorageHelpers(context);
	
	        return connectFn(req, res);
	    };
	}
	
	function fromHapi(server) {
	    var webtaskContext;
	
	    server.ext('onRequest', function (request, response) {
	        var normalizeRouteRx = createRouteNormalizationRx(request.x_wt.jtn);
	
	        request.setUrl(request.url.replace(normalizeRouteRx, '/'));
	        request.webtaskContext = webtaskContext;
	    });
	
	    return function (context, req, res) {
	        var dispatchFn = server._dispatch();
	
	        webtaskContext = attachStorageHelpers(context);
	
	        dispatchFn(req, res);
	    };
	}
	
	function fromServer(httpServer) {
	    return function (context, req, res) {
	        var normalizeRouteRx = createRouteNormalizationRx(req.x_wt.jtn);
	
	        req.originalUrl = req.url;
	        req.url = req.url.replace(normalizeRouteRx, '/');
	        req.webtaskContext = attachStorageHelpers(context);
	
	        return httpServer.emit('request', req, res);
	    };
	}
	
	
	// Helper functions
	
	function createRouteNormalizationRx(jtn) {
	    var normalizeRouteBase = '^\/api\/run\/[^\/]+\/';
	    var normalizeNamedRoute = '(?:[^\/\?#]*\/?)?';
	
	    return new RegExp(
	        normalizeRouteBase + (
	        jtn
	            ?   normalizeNamedRoute
	            :   ''
	    ));
	}
	
	function attachStorageHelpers(context) {
	    context.read = context.secrets.EXT_STORAGE_URL
	        ?   readFromPath
	        :   readNotAvailable;
	    context.write = context.secrets.EXT_STORAGE_URL
	        ?   writeToPath
	        :   writeNotAvailable;
	
	    return context;
	
	
	    function readNotAvailable(path, options, cb) {
	        var Boom = __webpack_require__(/*! boom */ 3);
	
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }
	
	        cb(Boom.preconditionFailed('Storage is not available in this context'));
	    }
	
	    function readFromPath(path, options, cb) {
	        var Boom = __webpack_require__(/*! boom */ 3);
	        var Request = __webpack_require__(/*! request */ 4);
	
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }
	
	        Request({
	            uri: context.secrets.EXT_STORAGE_URL,
	            method: 'GET',
	            headers: options.headers || {},
	            qs: { path: path },
	            json: true,
	        }, function (err, res, body) {
	            if (err) return cb(Boom.wrap(err, 502));
	            if (res.statusCode === 404 && Object.hasOwnProperty.call(options, 'defaultValue')) return cb(null, options.defaultValue);
	            if (res.statusCode >= 400) return cb(Boom.create(res.statusCode, body && body.message));
	
	            cb(null, body);
	        });
	    }
	
	    function writeNotAvailable(path, data, options, cb) {
	        var Boom = __webpack_require__(/*! boom */ 3);
	
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }
	
	        cb(Boom.preconditionFailed('Storage is not available in this context'));
	    }
	
	    function writeToPath(path, data, options, cb) {
	        var Boom = __webpack_require__(/*! boom */ 3);
	        var Request = __webpack_require__(/*! request */ 4);
	
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }
	
	        Request({
	            uri: context.secrets.EXT_STORAGE_URL,
	            method: 'PUT',
	            headers: options.headers || {},
	            qs: { path: path },
	            body: data,
	        }, function (err, res, body) {
	            if (err) return cb(Boom.wrap(err, 502));
	            if (res.statusCode >= 400) return cb(Boom.create(res.statusCode, body && body.message));
	
	            cb(null);
	        });
	    }
	}


/***/ },
/* 3 */
/*!***********************!*\
  !*** external "boom" ***!
  \***********************/
/***/ function(module, exports) {

	module.exports = require("boom");

/***/ },
/* 4 */
/*!**************************!*\
  !*** external "request" ***!
  \**************************/
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 5 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	var express  = __webpack_require__(/*! express */ 6);
	var app      = express();
	var template = __webpack_require__(/*! ./views/index.jade */ 7);
	var metadata = __webpack_require__(/*! ./webtask.json */ 10);
	var auth0    = __webpack_require__(/*! auth0-oauth2-express */ 11);
	
	app.use('/.extensions', __webpack_require__(/*! ./hooks */ 20));
	
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
	
	module.exports = app;


/***/ },
/* 6 */
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 7 */
/*!**************************!*\
  !*** ./views/index.jade ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	var jade = __webpack_require__(/*! ./~/jade/lib/runtime.js */ 8);
	
	module.exports = function template(locals) {
	var jade_debug = [ new jade.DebugItem( 1, "/Users/jcenturion/projects/experiments/sample-extension/views/index.jade" ) ];
	try {
	var buf = [];
	var jade_mixins = {};
	var jade_interp;
	;var locals_for_with = (locals || {});(function (baseUrl, description, domain) {
	jade_debug.unshift(new jade.DebugItem( 0, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	jade_debug.unshift(new jade.DebugItem( 1, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<!DOCTYPE html>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 2, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<html>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 3, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<head>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 3, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	jade_debug.unshift(new jade.DebugItem( 4, "/Users/jcenturion/projects/experiments/sample-extension/views/index.jade" ));
	buf.push("<title>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 4, jade_debug[0].filename ));
	buf.push("Sample Extension");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</title>");
	jade_debug.shift();
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 6, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<meta charset=\"UTF-8\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 7, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 8, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 9, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<meta name=\"description\"" + (jade.attr("content", '' + (description) + '', true, true)) + ">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 10, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 11, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<link rel=\"shortcut icon\" href=\"https://cdn.auth0.com/styleguide/2.0.1/lib/logos/img/favicon.png\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 12, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<link rel=\"apple-touch-icon\" href=\"apple-touch-icon.png\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 14, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.auth0.com/manage/v0.3.973/css/index.min.css\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 15, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.auth0.com/styleguide/latest/index.css\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 17, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<script type=\"text/javascript\" src=\"https://code.jquery.com/jquery-2.1.4.min.js\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.shift();
	buf.push("</script>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 18, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<script type=\"text/javascript\" src=\"https://fb.me/react-0.14.0.min.js\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.shift();
	buf.push("</script>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 19, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<script type=\"text/javascript\" src=\"https://fb.me/react-dom-0.14.0.js\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.shift();
	buf.push("</script>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 20, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<script type=\"text/javascript\" src=\"https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.shift();
	buf.push("</script>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 21, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<script type=\"text/javascript\" src=\"https://cdn.auth0.com/js/jwt-decode-1.4.0.min.js\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.shift();
	buf.push("</script>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 22, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<script type=\"text/javascript\" src=\"https://cdn.auth0.com/js/navbar-1.0.4.min.js\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.shift();
	buf.push("</script>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 25, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<script type=\"text/javascript\">");
	jade_debug.unshift(new jade.DebugItem( 25, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 25, jade_debug[0].filename ));
	buf.push("if (!sessionStorage.getItem(\"token\")) {");
	jade_debug.shift();
	buf.push("\n");
	jade_debug.unshift(new jade.DebugItem( 25, jade_debug[0].filename ));
	buf.push("  window.location.href = '" + (jade.escape((jade_interp = baseUrl) == null ? '' : jade_interp)) + "/login';");
	jade_debug.shift();
	buf.push("\n");
	jade_debug.unshift(new jade.DebugItem( 25, jade_debug[0].filename ));
	buf.push("}");
	jade_debug.shift();
	buf.push("\n");
	jade_debug.unshift(new jade.DebugItem( 25, jade_debug[0].filename ));
	buf.push("");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</script>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</head>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 26, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<body class=\"a0-extension\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 27, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<header class=\"dashboard-header\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 28, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<nav role=\"navigation\" class=\"navbar navbar-default\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 29, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<div class=\"container\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 30, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<div class=\"navbar-header\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 31, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<h1 class=\"navbar-brand\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 32, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<a href=\"http://manage.auth0.com/\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 33, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<span>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 33, jade_debug[0].filename ));
	buf.push("Auth0");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</span>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</a>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</h1>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 34, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<div id=\"navbar-collapse\" class=\"collapse navbar-collapse\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 35, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<script type=\"text/babel\">");
	jade_debug.unshift(new jade.DebugItem( 35, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 35, jade_debug[0].filename ));
	buf.push("ReactDOM.render(");
	jade_debug.shift();
	buf.push("\n");
	jade_debug.unshift(new jade.DebugItem( 35, jade_debug[0].filename ));
	buf.push("  <Navbar baseUrl=\"" + (jade.escape((jade_interp = baseUrl) == null ? '' : jade_interp)) + "\" domain=\"" + (jade.escape((jade_interp = domain) == null ? '' : jade_interp)) + "\"/>,");
	jade_debug.shift();
	buf.push("\n");
	jade_debug.unshift(new jade.DebugItem( 35, jade_debug[0].filename ));
	buf.push("  document.getElementById('navbar-collapse')");
	jade_debug.shift();
	buf.push("\n");
	jade_debug.unshift(new jade.DebugItem( 35, jade_debug[0].filename ));
	buf.push(");");
	jade_debug.shift();
	buf.push("\n");
	jade_debug.unshift(new jade.DebugItem( 35, jade_debug[0].filename ));
	buf.push("");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</script>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</nav>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</header>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 36, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<div class=\"container\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 37, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<div class=\"row\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 38, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<section class=\"content-page current\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 39, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<div class=\"col-xs-12\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 40, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	buf.push("<div id=\"my-application\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 6, "/Users/jcenturion/projects/experiments/sample-extension/views/layout.jade" ));
	jade_debug.unshift(new jade.DebugItem( 7, "/Users/jcenturion/projects/experiments/sample-extension/views/index.jade" ));
	buf.push("<h1>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 7, jade_debug[0].filename ));
	buf.push("Hello world!");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</h1>");
	jade_debug.shift();
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</section>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</body>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</html>");
	jade_debug.shift();
	jade_debug.shift();}.call(this,"baseUrl" in locals_for_with?locals_for_with.baseUrl:typeof baseUrl!=="undefined"?baseUrl:undefined,"description" in locals_for_with?locals_for_with.description:typeof description!=="undefined"?description:undefined,"domain" in locals_for_with?locals_for_with.domain:typeof domain!=="undefined"?domain:undefined));;return buf.join("");
	} catch (err) {
	  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "extends ./layout.jade\n\nblock title\n  title Sample Extension\n\nblock content\n  h1 Hello world!\n");
	}
	}

/***/ },
/* 8 */
/*!*******************************!*\
  !*** ./~/jade/lib/runtime.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * Merge two attribute objects giving precedence
	 * to values in object `b`. Classes are special-cased
	 * allowing for arrays and merging/joining appropriately
	 * resulting in a string.
	 *
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object} a
	 * @api private
	 */
	
	exports.merge = function merge(a, b) {
	  if (arguments.length === 1) {
	    var attrs = a[0];
	    for (var i = 1; i < a.length; i++) {
	      attrs = merge(attrs, a[i]);
	    }
	    return attrs;
	  }
	  var ac = a['class'];
	  var bc = b['class'];
	
	  if (ac || bc) {
	    ac = ac || [];
	    bc = bc || [];
	    if (!Array.isArray(ac)) ac = [ac];
	    if (!Array.isArray(bc)) bc = [bc];
	    a['class'] = ac.concat(bc).filter(nulls);
	  }
	
	  for (var key in b) {
	    if (key != 'class') {
	      a[key] = b[key];
	    }
	  }
	
	  return a;
	};
	
	/**
	 * Filter null `val`s.
	 *
	 * @param {*} val
	 * @return {Boolean}
	 * @api private
	 */
	
	function nulls(val) {
	  return val != null && val !== '';
	}
	
	/**
	 * join array as classes.
	 *
	 * @param {*} val
	 * @return {String}
	 */
	exports.joinClasses = joinClasses;
	function joinClasses(val) {
	  return (Array.isArray(val) ? val.map(joinClasses) :
	    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
	    [val]).filter(nulls).join(' ');
	}
	
	/**
	 * Render the given classes.
	 *
	 * @param {Array} classes
	 * @param {Array.<Boolean>} escaped
	 * @return {String}
	 */
	exports.cls = function cls(classes, escaped) {
	  var buf = [];
	  for (var i = 0; i < classes.length; i++) {
	    if (escaped && escaped[i]) {
	      buf.push(exports.escape(joinClasses([classes[i]])));
	    } else {
	      buf.push(joinClasses(classes[i]));
	    }
	  }
	  var text = joinClasses(buf);
	  if (text.length) {
	    return ' class="' + text + '"';
	  } else {
	    return '';
	  }
	};
	
	
	exports.style = function (val) {
	  if (val && typeof val === 'object') {
	    return Object.keys(val).map(function (style) {
	      return style + ':' + val[style];
	    }).join(';');
	  } else {
	    return val;
	  }
	};
	/**
	 * Render the given attribute.
	 *
	 * @param {String} key
	 * @param {String} val
	 * @param {Boolean} escaped
	 * @param {Boolean} terse
	 * @return {String}
	 */
	exports.attr = function attr(key, val, escaped, terse) {
	  if (key === 'style') {
	    val = exports.style(val);
	  }
	  if ('boolean' == typeof val || null == val) {
	    if (val) {
	      return ' ' + (terse ? key : key + '="' + key + '"');
	    } else {
	      return '';
	    }
	  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
	    if (JSON.stringify(val).indexOf('&') !== -1) {
	      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
	                   'will be escaped to `&amp;`');
	    };
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will eliminate the double quotes around dates in ' +
	                   'ISO form after 2.0.0');
	    }
	    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
	  } else if (escaped) {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + exports.escape(val) + '"';
	  } else {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + val + '"';
	  }
	};
	
	/**
	 * Render the given attributes object.
	 *
	 * @param {Object} obj
	 * @param {Object} escaped
	 * @return {String}
	 */
	exports.attrs = function attrs(obj, terse){
	  var buf = [];
	
	  var keys = Object.keys(obj);
	
	  if (keys.length) {
	    for (var i = 0; i < keys.length; ++i) {
	      var key = keys[i]
	        , val = obj[key];
	
	      if ('class' == key) {
	        if (val = joinClasses(val)) {
	          buf.push(' ' + key + '="' + val + '"');
	        }
	      } else {
	        buf.push(exports.attr(key, val, false, terse));
	      }
	    }
	  }
	
	  return buf.join('');
	};
	
	/**
	 * Escape the given string of `html`.
	 *
	 * @param {String} html
	 * @return {String}
	 * @api private
	 */
	
	exports.escape = function escape(html){
	  var result = String(html)
	    .replace(/&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/"/g, '&quot;');
	  if (result === '' + html) return html;
	  else return result;
	};
	
	/**
	 * Re-throw the given `err` in context to the
	 * the jade in `filename` at the given `lineno`.
	 *
	 * @param {Error} err
	 * @param {String} filename
	 * @param {String} lineno
	 * @api private
	 */
	
	exports.rethrow = function rethrow(err, filename, lineno, str){
	  if (!(err instanceof Error)) throw err;
	  if ((typeof window != 'undefined' || !filename) && !str) {
	    err.message += ' on line ' + lineno;
	    throw err;
	  }
	  try {
	    str = str || __webpack_require__(/*! fs */ 9).readFileSync(filename, 'utf8')
	  } catch (ex) {
	    rethrow(err, null, lineno)
	  }
	  var context = 3
	    , lines = str.split('\n')
	    , start = Math.max(lineno - context, 0)
	    , end = Math.min(lines.length, lineno + context);
	
	  // Error context
	  var context = lines.slice(start, end).map(function(line, i){
	    var curr = i + start + 1;
	    return (curr == lineno ? '  > ' : '    ')
	      + curr
	      + '| '
	      + line;
	  }).join('\n');
	
	  // Alter exception message
	  err.path = filename;
	  err.message = (filename || 'Jade') + ':' + lineno
	    + '\n' + context + '\n\n' + err.message;
	  throw err;
	};
	
	exports.DebugItem = function DebugItem(lineno, filename) {
	  this.lineno = lineno;
	  this.filename = filename;
	}


/***/ },
/* 9 */
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 10 */
/*!**********************!*\
  !*** ./webtask.json ***!
  \**********************/
/***/ function(module, exports) {

	module.exports = {
		"title": "Sample Extension",
		"name": "sample-extension",
		"version": "1.0.0",
		"author": "javier.centurion@auth0.com",
		"description": "A Sample Extension",
		"type": "application",
		"keywords": [
			"auth0"
		],
		"auth0": {
			"createClient": true,
			"scopes": "create:rules",
			"onInstallPath": "/.extensions/on-install",
			"onUninstallPath": "/.extensions/on-uninstall",
			"onUpdatePath": "/.extensions/on-update"
		}
	};

/***/ },
/* 11 */
/*!*****************************************!*\
  !*** ./~/auth0-oauth2-express/index.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	var express       = __webpack_require__(/*! express */ 6);
	var jade          = __webpack_require__(/*! jade */ 12);
	var expressJwt    = __webpack_require__(/*! express-jwt */ 13);
	var url           = __webpack_require__(/*! url */ 14);
	var rsaValidation = __webpack_require__(/*! auth0-api-jwt-rsa-validation */ 15);
	var bodyParser    = __webpack_require__(/*! body-parser */ 16);
	var jwt           = __webpack_require__(/*! jsonwebtoken */ 17);
	var request       = __webpack_require__(/*! superagent */ 18);
	
	var getClass = {}.toString;
	function isFunction(object) {
	  return object && getClass.call(object) == '[object Function]';
	}
	
	function fetchUserInfo (rootTenantAuthority) {
	  return function (req, res, next) {
	    request
	      .get(rootTenantAuthority + '/userinfo')
	      .set('Authorization', 'Bearer ' + req.body.access_token)
	      .end(function(err, userInfo){
	        if (err) {
	          res.redirect(res.locals.baseUrl);
	          return;
	        }
	
	        req.userInfo = userInfo.body;
	
	        next();
	      });
	  };
	}
	
	function generateApiToken (secretParam, expiresIn) {
	  return function (req, res, next) {
	    var secret = secretParam;
	    if (isFunction(secretParam)) {
	      secret = secretParam(req);
	    }
	
	    req.apiToken = jwt.sign(req.userInfo, secret, {
	      algorithm: 'HS256',
	      issuer: res.locals.baseUrl,
	      expiresIn: expiresIn
	    });
	
	    delete req.userinfo;
	    next();
	  };
	}
	
	module.exports = function (opt) {
	  var ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
	  var router              = express.Router();
	  var noop                = function (req, res, next) { next(); };
	  var callbackMiddlewares = [noop];
	
	  opt                     = opt || {};
	  opt.clientName          = opt.clientName || 'Auth0 Extension';
	  opt.clientId            = opt.clientId;
	  opt.exp                 = opt.exp || ONE_DAY_IN_MILLISECONDS;
	  // If we defaults to true all the routes will require authentication
	  opt.credentialsRequired = typeof opt.credentialsRequired === 'undefined' ? false : opt.credentialsRequired;
	  opt.scopes              = opt.scopes + ' openid profile';
	  opt.responseType        = opt.responseType || 'token';
	  opt.tokenExpiresIn      = opt.tokenExpiresIn || '10h';
	  opt.rootTenantAuthority = opt.rootTenantAuthority || 'https://auth0.auth0.com';
	  opt.authenticatedCallback = opt.authenticatedCallback || function(req, res, accessToken, next) {
	    next();
	  };
	
	  if (opt.apiToken && !opt.apiToken.secret) {
	    console.log('You are using a "development secret" for API token generation. Please setup your secret on "apiToken.secret".');
	    opt.apiToken.secret = __webpack_require__(/*! crypto */ 19).randomBytes(32).toString('hex');
	  }
	
	  if (opt.apiToken && opt.apiToken.secret) {
	    callbackMiddlewares = [fetchUserInfo(opt.rootTenantAuthority), opt.apiToken.payload || noop, generateApiToken(opt.apiToken.secret, opt.tokenExpiresIn)];
	  }
	
	  router.use(function (req, res, next) {
	    var protocol = 'https';
	    var pathname = url.parse(req.originalUrl).pathname
	                      .replace(req.path, '');
	
	    if ((process.env.NODE_ENV || 'development') === 'development') {
	      protocol = req.protocol;
	      opt.clientId = opt.clientId || 'N3PAwyqXomhNu6IWivtsa3drBfFjmWJL';
	    }
	
	    res.locals.baseUrl = url.format({
	      protocol: protocol,
	      host:     req.get('host'),
	      pathname: pathname
	    });
	
	    next();
	  });
	
	  router.use(bodyParser.urlencoded({ extended: false }));
	
	  router.use(expressJwt({
	    secret:     rsaValidation(),
	    algorithms: ['RS256'],
	    credentialsRequired: opt.credentialsRequired
	  }).unless({path: ['/login', '/callback']}));
	
	  router.get('/login', function (req, res) {
	    var redirectUri = res.locals.baseUrl + '/callback';
	    if (req.query.returnTo){
	      redirectUri += '?returnTo=' + encodeURIComponent(req.query.returnTo);
	    }
	    var audience;
	    if (typeof opt.audience === 'string') {
	      audience = '&audience=' + encodeURIComponent(opt.audience);
	    }
	    else if (typeof opt.audience === 'function') {
	      var a = opt.audience(req);
	      if (typeof a === 'string') {
	        audience = '&audience=' + encodeURIComponent(a);
	      }
	    }
	    var authorizationUrl = [
	      opt.rootTenantAuthority + '/i/oauth2/authorize',
	      '?client_id=' + (opt.clientId || res.locals.baseUrl),
	      '&response_type=' + opt.responseType,
	      '&response_mode=form_post',
	      '&scope=' + encodeURIComponent(opt.scopes),
	      '&expiration=' + opt.exp,
	      '&redirect_uri=' + redirectUri,
	      audience
	    ].join('');
	
	    res.redirect(authorizationUrl);
	  });
	
	  router.get('/logout', function (req, res) {
	    var template = [
	      'html',
	      '  head',
	      '    script.',
	      '      sessionStorage.removeItem(\'token\')',
	      '      sessionStorage.removeItem(\'apiToken\')',
	      '      window.location.href = \'' + opt.rootTenantAuthority + '/v2/logout?returnTo=#{baseUrl}\';',
	      '  body'
	    ].join('\n');
	    var content = jade.compile(template)({
	      baseUrl: res.locals.baseUrl
	    });
	
	    res.header("Content-Type", 'text/html');
	    res.status(200).send(content);
	  });
	
	  router.post('/callback', callbackMiddlewares, function (req, res) {
	    opt.authenticatedCallback(req, res, req.body.access_token, function(err) {
	      if (err) {
	        return res.sendStatus(500);
	      }
	
	      var template = [
	        'html',
	        '  head',
	        '    script.',
	        '      sessionStorage.setItem(\'token\', \'' + req.body.access_token + '\');',
	        callbackMiddlewares.length === 1 ? '' : '      sessionStorage.setItem(\'apiToken\', \'' + req.apiToken + '\');',
	        '      window.location.href = \'#{returnTo}\';',
	        '  body'
	      ].join('\n');
	      var content = jade.compile(template)({
	        returnTo: req.query.returnTo? req.query.returnTo : res.locals.baseUrl
	      });
	
	      res.header("Content-Type", 'text/html');
	      res.status(200).send(content);
	    });
	  });
	
	  router.get('/.well-known/oauth2-client-configuration', function (req, res) {
	    res.header("Content-Type", 'application/json');
	    res.status(200).send({
	      redirect_uris: [res.locals.baseUrl + '/callback'],
	      client_name:   opt.clientName,
	      post_logout_redirect_uris: [res.locals.baseUrl]
	    });
	  });
	
	  return router;
	};


/***/ },
/* 12 */
/*!***********************!*\
  !*** external "jade" ***!
  \***********************/
/***/ function(module, exports) {

	module.exports = require("jade");

/***/ },
/* 13 */
/*!******************************!*\
  !*** external "express-jwt" ***!
  \******************************/
/***/ function(module, exports) {

	module.exports = require("express-jwt");

/***/ },
/* 14 */
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 15 */
/*!***********************************************!*\
  !*** external "auth0-api-jwt-rsa-validation" ***!
  \***********************************************/
/***/ function(module, exports) {

	module.exports = require("auth0-api-jwt-rsa-validation");

/***/ },
/* 16 */
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 17 */
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ function(module, exports) {

	module.exports = require("jsonwebtoken");

/***/ },
/* 18 */
/*!*****************************!*\
  !*** external "superagent" ***!
  \*****************************/
/***/ function(module, exports) {

	module.exports = require("superagent");

/***/ },
/* 19 */
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 20 */
/*!************************!*\
  !*** ./hooks/index.js ***!
  \************************/
/***/ function(module, exports, __webpack_require__) {

	var express  = __webpack_require__(/*! express */ 6);
	var Request  = __webpack_require__(/*! superagent */ 18);
	var ManagementClient = __webpack_require__(/*! auth0@2.1.0 */ 21).ManagementClient;
	var _        = __webpack_require__(/*! lodash */ 22);
	var jwt      = __webpack_require__(/*! jsonwebtoken */ 17);
	var hooks    = express.Router();
	
	module.exports = hooks;
	
	// Validate JWT
	hooks.use(function (req, res, next) {
	  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
	    var token   = req.headers.authorization.split(' ')[1];
	    var isValid = jwt.verify(token, req.webtaskContext.data.EXTENSION_SECRET, {
	      audience: req.webtaskContext.data.WT_URL,
	      issuer: 'https://' + req.webtaskContext.data.AUTH0_DOMAIN
	    });
	
	    if (!isValid) {
	      return res.sendStatus(401);
	    }
	
	    return next();
	  }
	
	  return res.sendStatus(401);
	});
	
	// Getting Auth0 APIV2 access_token
	hooks.use(function (req, res, next) {
	  getToken(req, function (access_token, err) {
	    if (err) return next(err);
	
	    var management = new ManagementClient({
	      domain: req.webtaskContext.data.AUTH0_DOMAIN,
	      token: access_token
	    });
	
	    req.auth0 = management;
	
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
	
	// This endpoint would be called by webtask-gallery
	hooks.put('/on-update', function (req, res) {
	  res.sendStatus(204);
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


/***/ },
/* 21 */
/*!******************************!*\
  !*** external "auth0@2.1.0" ***!
  \******************************/
/***/ function(module, exports) {

	module.exports = require("auth0@2.1.0");

/***/ },
/* 22 */
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map