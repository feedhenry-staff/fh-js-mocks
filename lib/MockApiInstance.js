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
