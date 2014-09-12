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
