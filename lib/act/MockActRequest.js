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
