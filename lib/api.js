'use strict';

module.exports = {
  // Stub interfaces are exposed here
  act: require('./act')
};

// Override the existing $fh implementation on the window object if required
if (typeof window !== 'undefined' && window.$fh) {
  for (var i in module.exports) {
    if (module.exports.hasOwnProperty(i)) {
      window.$fh[i] = module.exports[i];
    }
  }
} else if (typeof window !== 'undefined') {
  var err = 'fh-mocks: window.$fh is not defined, mocks cannot initialise!';
  throw new Error(err);
}
