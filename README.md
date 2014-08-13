FeedHenry Mocks
===================================

A mocked out version of the FeedHenry JS SDK to enable unit testing of 
application logic without the need to actually perform requests.

## Usage
To use these mocks simply include them in a script tag in a custom test HTML 
file or inject them using Karma (which is a much better idea). 

These should be included *AFTER* the standard SDK script 
(if you're including it) to ensure the overrides apply correctly to the SDK.

What's quite nice about this is that you can write all tests in a blocking 
manner which keeps things pretty simple. You can write them using non-blocking 
syntax via the usual Jasmine/Mocha *done* callback (these are the only two I'm 
familiar with) if required too, just call the mock *flush* method when 
]appropriate.


## Example
```javascript

'use strict';

var assert = require('assert');

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
	});


	describe('#login', function () {

		it('Should successfully login.', function () {
			// We tell $fh.act that a request with these parameters should be
			// expected to be called.
			$fh.act.expect({
				act: 'login',
				u: USER,
				p: PASS
			})
			// Since we're using $fh.act we mimic the cloud response callback
			// structure here. The first arg is an error, the second is a 
			// response; just like in cloud/main.js
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
This library mimics the normal FeedHenry JavaScript SDK. Currently only the 
$fh.act API is mocked out but more can be done as necessary and this could be 
largely genericised as the structure for most API calls is very similar.

### FH.Act
Works just like the regular Act API. OK, *almost* like the regular Act API. It's 
still that same old function you called like $fh.act(opts, success, fail). 
What's different is that it has some new functions appended as described here, 
and demonstrated in the above example.

##### .expect(opts)
The expect function tells our mock Act service to expect a specific input and 
returns a *MockHandler* that allows us to configure a response scenario as 
detailed below.

##### flush([count])
Respond to *count* requests that have been queued to the Act mock.

##### verifyNoOutstandingRequest()
Verify that all requests were satisfied. Can be called in an *afterEach* hook 
to ensure you're cleanly testing each request.

#####verifyNoOutstandingExpectation()
Verify that all expectation were had a request made for them. Can be called in 
an *afterEach* hook to ensure you're not defining unnecessary expectations and 
that those you do declare are utilised.

##### ERRORS (Hopefully coming soon...)
This would be pretty awesome. When calling the *setResponse* function on a 
MockHandler you could provide $fh.act.ERRORS.TIMEOUT, or similar, as the error 
argument and simulate the different types of errors that may occur:

* NO_ACTNAME_PROVIDED (No 'act' was provided in the options object)
* UNKNOWN_ERROR
* UNKNOWN_ACT (Act not exported in *cloud/main.js*)
* TIMEOUT
* PARSE_ERROR (Response JSON could not be parsed)


### MockHandler
This class should be used to configure responses to your SDK inputs. The only 
function you should need to use is *setResponse* unless certain edge cases 
arise that require otherwise.

##### setResponse(err, res)
Configure the response that should be returned. Provided a non *null* value as 
the first parameter will cause the error callback of the SDK to be called 
upon flushing the request queue. 






