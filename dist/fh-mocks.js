(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * A handler class for managing $fh.act mock responses
 * @constructor
 * @param {Object} args   The args provided to $fh.act
 */
function MockActRequest (args, success, fail) {
  this._args = args;
  this._fail = fail;
  this._success = success;
  this._responded = false;
}
module.exports = MockActRequest;

MockActRequest.prototype.getArgs = function () {
  return this._args;
};

MockActRequest.prototype.fail = function () {
  this._fail.apply(this, Array.prototype.slice.call(arguments));
  this._responded = true;
};

MockActRequest.prototype.success = function () {
  this._success.apply(this, Array.prototype.slice.call(arguments));
  this._responded = true;
};

MockActRequest.prototype.hasReceivedResponse = function () {
  return this._responded;
};

},{}],2:[function(require,module,exports){
'use strict';

/**
 * A handler class for managing mock responses
 * @constructor
 * @param {Object} args - The args provided to $fh.{METHOD}
 */
function MockHandler (args) {
  this._expectedArgs = args;
  this._response = {};
  this._errBack = false;
  this._responded = false;
}
module.exports = MockHandler;


/**
 * Get the response that should be returned by this handler.
 * @param   {Mixed} err - The err parameter you'd send to the cloud callback.
 * @param   {Mixed} res - The res parameter you'd send to the cloud callback.
 * @returns {MockHandler}
 */
MockHandler.prototype.setResponse = function(err, res) {
  if (err) {
    this._errBack = true;
    this._response = err;
  } else {
    this._response = res;
  }

  return this;
};


/**
 * Respond to the provided request.
 * Call the err or success callback depending on the values provided to
 * setResponse
 * @param {MockActRequest} req
 */
MockHandler.prototype.respond = function (req) {
  if (this._errBack) {
    // TODO: Update to mimic the object adnd messages returned from the SDK
    req.fail(this._response);
  } else {
    req.success(this._response);
  }

  this._responded = true;
};


/**
 * Check has this request been responded to.
 * @returns {Boolean}
 */
MockHandler.prototype.hasResponded = function() {
  return this._responded;
};


/**
 * Get the args expected by this handler.
 * @return  {Mixed}
 */
MockHandler.prototype.getExpectedArgs = function() {
  return this._expectedArgs;
};


/**
 * Check if the provided args match the expected args.
 * @param {MockActRequest}  req
 * @param {Function}        callback
 */
MockHandler.prototype.argsMatch = function (req) {
  var argsStr = JSON.stringify(req.getArgs())
    , expectedStr = JSON.stringify(this.getExpectedArgs());

  return (expectedStr === argsStr);
};

},{}],3:[function(require,module,exports){
'use strict';


var MockHandler = require('./MockHandler')
  , MockActRequest = require('./MockActRequest');


/**
 * Handlers for expected $fh.act calls.
 * @private
 */
var expectations = []
  , requests = [];


/**
 * Get the handler for a given request.
 * @param   {Object} req
 * @returns {MockHandler}
 */
function getExpectationForRequest (req) {
  for (var i = 0; i < expectations.length; i++) {
    if (expectations[i].argsMatch(req)) {
      return expectations[i];
    }
  }

  return null;
}


/**
 * An Act mock function that mimics the $fh.act API
 * @param   {Object}    opts
 * @param   {Function}  success
 * @param   {Function}  fail
 * @retuns  {MockHandler}
 */
var MockAct = module.exports = function MockAct(opts, success, fail) {
  requests.push(new MockActRequest(opts, success, fail));
};


/**
 * Setup an Act expectation. Simply provide the parameters to expect.
 * @param   {Object}          opts
 * @returns {MockHandler}
 */
MockAct.expect = function (opts) {
  var h = new MockHandler(opts);

  expectations.push(h);

  return h;
};

/**
 * Represent the number of requests awaiting a response.
 * @returns {Number}
 */
MockAct.queLength = function () {
  return requests.length;
};


/**
 * Remove all expectations that were defined.
 */
MockAct.resetExpectations = function () {
  expectations = [];
  requests = [];
};


/**
 * Check that all requests were flushed successfully.
 */
MockAct.verifyNoOutstandingRequest = function () {
  if (requests.length) {
    throw new Error('Act has unflushed requests ' + requests.join(', '));
  }
};


/**
 * Check that all expectations have been satisfied.
 */
MockAct.verifyNoOutstandingExpectation = function () {
  if (expectations.length) {
    throw new Error('Act has unsatisfied expectations ' +
      expectations.join(', '));
  }
};


/**
 * Flush all pending requests for resolution.
 * Requests are responded to on a first in first out basis.
 * @param {Number} count - How many queued requests to responed to.
 */
MockAct.flush = function(count, force) {
  var req = null
    , expectation = null;

  if (typeof count === 'boolean') {
    force = count;
    count = requests.length;
  } else {
    count = count || requests.length;
  }

  // Loop requests and respond where possible
  for (var i = 0; i < count; i++) {
    req = requests[i];
    expectation = getExpectationForRequest(req);

    if (expectation) {
      expectation.respond(req);
    }
  }

  // Remove requests that have received a response
  requests = requests.filter(function (r) {
    if (force) {
      return false;
    } else {
      return !r.hasReceivedResponse();
    }
  });

  // Remove expectations that responded to a request
  expectations = expectations.filter(function (e) {
    if (force) {
      return false;
    } else {
      return !e.hasResponded();
    }
  });
};

},{"./MockActRequest":1,"./MockHandler":2}],4:[function(require,module,exports){
'use strict';

module.exports = {
  // Stub interfaces are exposed here
  act: require('./act')
};

// Override the existing $fh implementation on the window object if required
if (typeof window !== 'undefined') {
  if (!window.$fh) {
    window.$fh = {};
  }

  // Override $fh APIs
  for (var i in module.exports) {
    if (module.exports.hasOwnProperty(i)) {
      window.$fh[i] = module.exports[i];
    }
  }
}

},{"./act":3}]},{},[4]);
