'use strict';

var MockApiInstance = require('./MockApiInstance')
  , xtend = require('xtend')
  , originalApiFns = {};


// Allow use as a standard node.js module / with browserify
module.exports = {
  createApiShim: createApiShim,
  restoreOriginalApi: restoreOriginalApi
};


// Ensure $fh is defined globally
if (typeof $fh === 'undefined') {
  if (typeof window !== 'undefined') {
    window.$fh = {};
  } else {
    // So we can test in Node.js apps, no karma/servers required
    global.$fh = {};
  }
}

// Add the mock's extensions to the FH SDK
$fh = xtend($fh, module.exports);

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
  originalApiFns[apiName] = $fh[apiName];

  // Override the existing version?
  if (!noOverride) {
    $fh[apiName] = shim;
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
  $fh[apiName] = originalApiFns[apiName];
}
