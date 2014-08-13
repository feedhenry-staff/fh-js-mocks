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
