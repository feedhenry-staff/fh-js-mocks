mocha 		= ./node_modules/.bin/mocha
jshint		= ./node_modules/.bin/jshint
linelint 	= ./node_modules/.bin/linelint
lintspaces 	= ./node_modules/.bin/lintspaces
browserify 	= ./node_modules/.bin/browserify

srcFiles = $(shell find ./lib -type f -name '*.js' | xargs)
testFiles = $(shell find ./test -type f -name '*.js' | xargs)

.PHONY : test

default: format

# Run tests, then build the JavaScript Browserified bundle
build:test
	$(browserify) -e ./lib/api.js -o ./dist/fh-mocks.js
	@echo "\nBuild succeeded!\n"

# Test file for formatting and errors, then run tests
test:format
	$(mocha) -R spec ./test/*.js

# Test file formatting and for errors
format:
	$(linelint) $(srcFiles) $(testFiles)
	@echo "\nlinelint pass!\n"

	$(lintspaces) -nt -i js-comments -d spaces -s 2 $(srcFiles) $(testFiles)
	@echo "\nlintspaces pass!\n"
	
	$(jshint) $(srcFiles) $(testFiles)
	@echo "\nJSHint pass!\n"