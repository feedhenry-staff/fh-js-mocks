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
