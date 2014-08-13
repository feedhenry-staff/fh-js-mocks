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
