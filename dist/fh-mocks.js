(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * A handler class for managing $fh.api mock responses
 * @constructor
 * @param {Object} args   The args provided to $fh.api call
 */
function MockApiCall (args, success, fail) {
  this._args = args;
  this._fail = fail;
  this._success = success;
  this._responded = false;
}
module.exports = MockApiCall;

MockApiCall.prototype.getArgs = function () {
  return this._args;
};

MockApiCall.prototype.fail = function () {
  this._fail.apply(this, Array.prototype.slice.call(arguments));
  this._responded = true;
};

MockApiCall.prototype.success = function () {
  this._success.apply(this, Array.prototype.slice.call(arguments));
  this._responded = true;
};

MockApiCall.prototype.hasReceivedResponse = function () {
  return this._responded;
};

},{}],2:[function(require,module,exports){
'use strict';


var MockApiResponder = require('./MockApiResponder')
  , MockApiCall = require('./MockApiCall');


module.exports = function getMockApiInstance () {
  var expectations = []
    , requests = [];

  /**
   * An api mock function that mimics a $fh.api API
   * @retuns  {Function}
   */
  function MockApiInstance(opts, success, fail) {
    requests.push(new MockApiCall(opts, success, fail));
  }

  /**
   * Add a request
   * @param   {Object}    opts
   * @param   {Function}  success
   * @param   {Function}  fail
   * @retuns  {MockApiResponder}
   */
  MockApiInstance.makeRequest = function (opts, success, fail) {
    requests.push(new MockApiCall(opts, success, fail));
  };

  /**
   * Setup an api expectation. Simply provide the parameters to expect.
   * @param   {Object}          opts
   * @returns {MockApiResponder}
   */
  MockApiInstance.expect = function (opts) {
    var h = new MockApiResponder(opts);

    expectations.push(h);

    return h;
  };

  /**
   * Represent the number of requests awaiting a response.
   * @returns {Number}
   */
  MockApiInstance.queLength = function () {
    return requests.length;
  };


  /**
   * Remove all expectations that were defined.
   */
  MockApiInstance.resetExpectations = function () {
    expectations = [];
    requests = [];
  };


  /**
   * Check that all requests were flushed successfully.
   */
  MockApiInstance.verifyNoOutstandingRequest = function () {
    if (requests.length) {
      throw new Error('api has unflushed requests ' + requests.join(', '));
    }
  };


  /**
   * Check that all expectations have been satisfied.
   */
  MockApiInstance.verifyNoOutstandingExpectation = function () {
    if (expectations.length) {
      throw new Error('api has unsatisfied expectations ' +
        expectations.join(', '));
    }
  };


  /**
   * Get the handler for a given request.
   * @param   {Object} req
   * @returns {MockApiResponder}
   */
  MockApiInstance.getExpectationForRequest = function (req) {
    for (var i = 0; i < expectations.length; i++) {
      if (expectations[i].argsMatch(req)) {
        return expectations[i];
      }
    }

    return null;
  };


  /**
   * Flush all pending requests for resolution.
   * Requests are responded to on a first in first out basis.
   * @param {Number} count - How many queued requests to responed to.
   */
  MockApiInstance.flush = function (count, force) {
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
      expectation = this.getExpectationForRequest(req);

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


  return MockApiInstance;
};

},{"./MockApiCall":1,"./MockApiResponder":3}],3:[function(require,module,exports){
'use strict';

/**
 * A handler class for managing mock responses
 * @constructor
 * @param {Object} args - The args provided to $fh.{METHOD}
 */
function MockApiResponder (args) {
  this._expectedArgs = args;
  this._response = {};
  this._errBack = false;
  this._responded = false;
}
module.exports = MockApiResponder;


/**
 * Get the response that should be returned by this handler.
 * @param   {Mixed} err - The err parameter you'd send to the cloud callback.
 * @param   {Mixed} res - The res parameter you'd send to the cloud callback.
 * @returns {MockApiResponder}
 */
MockApiResponder.prototype.setResponse = function(err, res) {
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
MockApiResponder.prototype.respond = function (req) {
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
MockApiResponder.prototype.hasResponded = function() {
  return this._responded;
};


/**
 * Get the args expected by this handler.
 * @return  {Mixed}
 */
MockApiResponder.prototype.getExpectedArgs = function() {
  return this._expectedArgs;
};


/**
 * Check if the provided args match the expected args.
 * @param {MockActRequest}  req
 * @param {Function}        callback
 */
MockApiResponder.prototype.argsMatch = function (req) {
  var argsStr = JSON.stringify(req.getArgs())
    , expectedStr = JSON.stringify(this.getExpectedArgs());

  return (expectedStr === argsStr);
};

},{}],4:[function(require,module,exports){
'use strict';

var MockApiInstance = require('./MockApiInstance')
  , xtend = require('xtend')
  , originalApiFns = {};


// Allow use as a standard node.js module / with browserify
module.exports = {
  createApiShim: createApiShim,
  restoreOriginalApi: restoreOriginalApi
};


// Ensure window.$fh is defined
if (typeof window !== 'undefined') {
  if (!window.$fh) {
    window.$fh = {};
  }

  // Add the mock's extensions to the FH SDK
  window.$fh = xtend(window.$fh, module.exports);
}

/**
 * Create a shim for the given API and override the one on window.$fh
 * @param  {String}   apiName     The api you want to shim e.g "cloud"
 * @param  {Boolean}  noOverride  If true window.$fh api will not be replaced.
 *                                You'll probably rarely/never set this to true
 * @return {MockApiInstance}  A mock API instance to play with
 */
function createApiShim (apiName, noOverride) {
  var shim = new MockApiInstance();

  // Store the original function so it can be restored
  if (typeof window !== 'undefined') {
    originalApiFns[apiName] = window.$fh[apiName];
  }

  // Override the existing version?
  if (!noOverride && typeof window !== 'undefined') {
    window.$fh[apiName] = shim;
  }

  // Bind the shim to the exports object
  return module.exports[apiName] = shim;
}


/**
 * Restore an original $fh.api that was overwritten by createApiShim.
 * Only works if window.$fh is defined.
 * @param  {String} apiName The API whose original function you to restore
 */
function restoreOriginalApi (apiName) {
  if (typeof window !== 'undefined') {
    window.$fh = originalApiFns[apiName];
  }
}

},{"./MockApiInstance":2,"xtend":5}],5:[function(require,module,exports){
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[4]);
