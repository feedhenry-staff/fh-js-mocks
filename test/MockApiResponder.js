'use strict';

var expect = require('chai').expect
  , sinon = require('sinon')
  , MockApiCall = require('../lib/MockApiCall')
  , MockApiResponder = require('../lib/MockApiResponder');


// Sample args
var TEST_OPTS = {
  a: 'a',
  b: 'b',
  num: 123
};

var TEST_RESPONSE = {
  status: 'ok'
};

// Used for tests
var mh;

describe('MockApiResponder', function () {
  beforeEach(function () {
    mh = new MockApiResponder(TEST_OPTS);
  });


  describe('#MockApiResponder', function () {
    it('Should create a MockApiResponder as expected', function () {
      var m = new MockApiResponder(TEST_OPTS);

      expect(m).to.be.a('object');
      expect(m).to.have.property('_expectedArgs').to.equal(TEST_OPTS);
      expect(m).to.have.property('_response');
      expect(m).to.have.property('_errBack').to.equal(false);
    });
  });


  describe('#getExpectedArgs', function () {
    it('Should get the args provided to the constructor', function () {

      for (var i in TEST_OPTS) {
        if (TEST_OPTS.hasOwnProperty(i)) {
          expect(mh.getExpectedArgs()).to.have.property(i);

          var val = TEST_OPTS[i];
          expect(mh.getExpectedArgs()).to.have.property(i).to.equal(val);
        }
      }
    });
  });


  describe('#setResponse', function () {
    it('Should set the response on the handler', function () {
      mh.setResponse(null, TEST_RESPONSE);
      expect(mh).to.have.property('_errBack').to.equal(false);
      expect(mh).to.have.property('_response');
      expect(mh).to.have.property('_response').to.equal(TEST_RESPONSE);
    });

    it('Should set the handler up for error response', function () {
      mh.setResponse(TEST_RESPONSE, null);
      expect(mh).to.have.property('_errBack').to.equal(true);
      expect(mh).to.have.property('_response');
      expect(mh).to.have.property('_response').to.equal(TEST_RESPONSE);
    });
  });


  describe('#argsMatch', function () {
    it('Should return true', function () {
      expect(mh.argsMatch(new MockApiCall(TEST_OPTS))).to.equal(true);
    });

    it('Should return false', function () {
      expect(mh.argsMatch(new MockApiCall({a:'a'}))).to.equal(false);
    });
  });


  describe('#respond', function () {
    it('Should fire the success callback once', function () {
      var success = sinon.spy();
      var fail = sinon.spy();
      var req = new MockApiCall(TEST_OPTS, success, fail);

      mh.setResponse(null, TEST_RESPONSE);
      mh.respond(req);

      expect(mh.hasResponded()).to.equal(true);
      expect(success.called).to.equal(true);
      expect(success.calledOnce).to.equal(true);
      expect(fail.called).to.equal(false);
      expect(fail.calledOnce).to.equal(false);
    });

    it('Should fire the fail callback once', function () {
      var success = sinon.spy();
      var fail = sinon.spy();
      var req = new MockApiCall(TEST_OPTS, success, fail);

      mh.setResponse(TEST_RESPONSE, null);
      mh.respond(req);

      expect(mh.hasResponded()).to.equal(true);
      expect(success.called).to.equal(false);
      expect(success.calledOnce).to.equal(false);
      expect(fail.called).to.equal(true);
      expect(fail.calledOnce).to.equal(true);
    });
  });
});
