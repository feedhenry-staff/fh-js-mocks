'use strict';

var expect = require('chai').expect
  , sinon = require('sinon')
  , act = require('../lib/act');

var TEST_OPTS = {
  act: 'test',
  req: {
    name: 'Evan'
  }
};

function noop() {}

describe('Act', function () {
  beforeEach(function () {
    // Deactivate all old requests
    act.flush(true);

    // Remove old expectations to avoid clashses as we reuse the same
    // expectations object - TEST_OPTS
    act.resetExpectations();
  });


  describe('#queLength', function () {
    it('Should return 0', function () {
      expect(act.queLength()).to.equal(0);
    });

    it('Should add a request to the queue and be of length 1', function () {
      act(TEST_OPTS, noop, noop);
      expect(act.queLength()).to.equal(1);

      act.expect(TEST_OPTS);
    });
  });


  describe('#flush', function () {
    it('Should run but not fire callbacks due to no handlers', function () {
      expect(act.queLength()).to.equal(0);

      var s1 = sinon.spy()
        , s2 = sinon.spy()
        , f1 = sinon.spy()
        , f2 = sinon.spy();

      act(TEST_OPTS, s1, f1);
      act(TEST_OPTS, s2, f2);

      expect(act.queLength()).to.equal(2);

      act.flush();

      // Callbacks should not be fired as no handler was assigned
      expect(s1.called).to.equal(false);
      expect(s2.called).to.equal(false);
      expect(f1.called).to.equal(false);
      expect(f2.called).to.equal(false);
    });
  });


  describe('#expect', function () {
    it('Should add an expectation', function () {
      act.expect(TEST_OPTS);
      expect(act.queLength()).to.equal(0);
    });

    it('Should add an expectation and satisfy it with a handler', function () {
      var s = sinon.spy()
        , f = sinon.spy();

      // Add an expectation
      act.expect(TEST_OPTS).setResponse(null, {});

      // Queue our request
      act(TEST_OPTS, s, f);
      expect(act.queLength()).to.equal(1);

      // Respond to request
      act.flush();

      expect(s.called).to.equal(true);
      expect(f.called).to.equal(false);
    });
  });

});
