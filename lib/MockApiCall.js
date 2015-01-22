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
