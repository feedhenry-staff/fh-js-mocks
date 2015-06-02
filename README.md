FeedHenry Mocks
===================================

A library that enables you to mock out APIs from the FeedHenry JS SDK. This 
enables unit testing of application logic without the need to actually run the 
SDK code which may be impractical or impossible for testing purposes.

## Usage
To use this mocking library simply include it in a script tag in a custom test 
HTML file or inject it using Karma (which is a much better idea). Alternatively
you can run your tests in a Node.js environment since this module will create a
_$fh_ global on either _window_ or _global_ depending on where you're running 
it, a browser or Node.js respectively. See 
[here](https://github.com/feedhenry-staff/cloud-connection-monitor) for an 
example of Node.js tests for a library that is actually meant for a browser!

This should be included *instead of* or *after* the standard _feedhenry.js_ SDK 
script when testing.

What's nice about this is that you can write all tests in a blocking 
manner which keeps things pretty simple. You can write them using non-blocking 
syntax via the usual Jasmine/Mocha *done* callback (these are the only two I'm 
familiar with) if required too, just call the mock *flush* method when 
appropriate.


## Example
```javascript

'use strict';

var assert = require('assert');
// var fh = require('fh-js-mocks') <-- Possible with browserify

var USER = 'johndoe',
	PASS = 'ismaithliomcácamilis';

describe('Some Controller/Model', function () {
	
	afterEach(function () {
		// Makes sure we're using and responding to all request planned per test
		// If you define an expect and never send the corresponding 
		// request ($fh.act) then verifyNoOutstandingExpectation will throw an
		// error. The same goes for verifyNoOutstandingRequest expect it throws
		// for requests that have no expectation to match
		$fh.act.verifyNoOutstandingRequest();
		$fh.act.verifyNoOutstandingExpectation();

		// This is optional. It will restore the original act function
		// if you have included feedhenry.js
		$fh.restoreOriginalApi('act');
	});

	beforeEach(function () {
		// Create a shim function to replace the regular before running tests
		$fh.createApiShim('act');
	});


	describe('#login', function () {

		it('Should successfully login.', function () {
			// We tell $fh.act that a request with these parameters should be
			// expected to be called.
			$fh.act.expect({
				act: 'login',
				req: {
					u: USER,
					p: PASS
				}
			})
			// The set response function takes two args. 
			// The first arg, if not null will cause the error/fail callback
			// to be called with the given value. The second arg will be the 
			// result passed to the success callback but will only be triggered 
			// if the first arg is null
			.setResponse(null, {
				session: 'e4b6f7cfbe45a24e4773c6c2f59a0c41'
				data: {
					user: USER,
					dob: '1985-08-13'
				}
			});

			// The login function uses $fh.act internally
			MyController.login(USER, PASS, function (err, res) {
				assert.equal(err, null);
				assert(res);
				assert.equal(typeof res.session, 'string');
				// etc...
			});

			// Respond to any requests we've queued to $fh.act so far.
			// This will trigger the callback provided to MyController.login
			$fh.act.flush();
		});

	});

});
```


## API
This library mimics the normal FeedHenry JavaScript SDK. As you might be aware 
the majority of API functions work like so: 

```javascript
$fh.someApi(options, successCallback, failCallback);
```

This library allows you to override existing implementations, and will create 
one if none exists. For example this will replace/create the $fh.act API:

```
$fh.createShim('act');
```

### MockApiInstance
Created using _$fh.createApiShim(name)_. Works just like a regular $fh API. 
Well, *almost* like a regular API. It's still a same old function definition 
you know and love: _$fh.someApi(opts, success, fail)_. What's different is that 
it has some new functions appended as described here, and demonstrated in the 
examples.

##### MockApiInstance.expect(input)
The expect function tells our mock API service to expect a specific _input_ and 
returns a *MockApiResponder* that allows us to configure a response scenario 
for the given _input_ as detailed below.

##### MockApiInstance.flush([count])
Respond to *count* calls that have been queued to the API mock. Calls are only 
responed to if the same parameters it provided were given via an expect. The 
parameter comparison is done by using _JSON.stringify_ on your inputs passed to 
_$fh.shim.expect(input)_ and _$fh.shim(inputs, success, fail)_.

You'll probably not need to supply the optional _count_ argument often, perhaps 
even never.

##### MockApiInstance.verifyNoOutstandingRequest()
Verify that all calls to your shim were satisfied. Can be called in an 
*afterEach* hook to ensure you're cleanly responding to each call.

##### MockApiInstance.verifyNoOutstandingExpectation()
Verify that all expectations had a request made for them. Can be called in an 
*afterEach* hook to ensure you're not defining unnecessary expectations and 
that those you do declare are utilised.

### MockApiResponder
An instance of this is returned from $fh.shim.expect. This class should be 
used to configure responses to your SDK inputs. The only function you should 
need to use is *setResponse* unless certain edge cases arise that require 
otherwise.

##### setResponse(err, res)
Configure the response that should be returned when inputs to _expect_ match 
the input you provide to $fh.shim. Providing a non *null* value as the first 
parameter will cause the error callback you provided to the SDK to be called 
upon flushing the api call queue using _flush_. See the example below:

```javascript

describe('Test Our Push Module', function () {
	afterEach(function () {
		$fh.push.verifyNoOutstandingRequest();
		$fh.push.verifyNoOutstandingExpectation();
		$fh.restoreOriginalApi('push');
	});

	beforeEach(function () {
		// Create a shim function for $fh.push
		$fh.createApiShim('push');
	});

	it('Should handle failure and return SDK error', function () {
		var ERR_CODE = 'push_nosupport';

		var responder = $fh.push.expect({
			act: 'register'
		});

		responder.setResponse(ERR_CODE, null);

		// Uses $fh.push internally
		PushModule.register(funcion (sdkError, result) {
			assert.equal(sdkError, ERR_CODE);
		});

		$fh.push.flush();
	});

	it('Should handle failure and return SDK error', function () {
		var FAKE_TEST_RES = {
			deviceToken: '12345890'
		};

		var responder = $fh.push.expect({
			act: 'register'
		});

		responder.setResponse(null, FAKE_TEST_RES);

		// Uses $fh.push internally
		PushModule.register(funcion (sdkError, result) {
			assert(result)
			assert.equal(result.deviceToken, FAKE_TEST_RES.deviceToken);
		});

		$fh.push.flush();
	});
});

```






