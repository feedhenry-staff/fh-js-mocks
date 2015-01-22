'use strict';

var expect = require('chai').expect
  , sinon = require('sinon')
  , MockApiCall = require('../lib/MockApiCall');


var success = sinon.spy()
  , fail = sinon.spy()
  , mar = null
  , TEST_OPTS = {
    act: 'test',
    req: {
      one: 1,
      two: 2
    }
  };


describe('MockApiCall', function () {
  beforeEach(function () {
    success = sinon.spy();
    fail = sinon.spy();
    mar = new MockApiCall(TEST_OPTS, success, fail);
  });

  describe('#MockApiCall', function () {
    it ('Should be constructed with the correct values', function () {
      expect(mar._success).to.be.a('function');
      expect(mar._fail).to.be.a('function');
      expect(mar._args).to.be.a('object');
    });
  });

  describe('#getArgs', function () {
    it('Should have the expected args provided', function () {
      expect(mar.getArgs()).to.be.a('object');
      expect(mar.getArgs()).to.have.property('act').to.equal('test');
      expect(mar.getArgs()).to.have.property('req');
    });
  });

  describe('#fail', function () {
    it('Should be called once and called with all provided args', function () {
      expect(fail.called).to.equal(false);

      mar.fail(1, 2, 3);

      expect(fail.calledOnce).to.equal(true);
      expect(fail.calledWith(1, 2, 3)).to.equal(true);
    });
  });

  describe('#success', function () {
    it('Should be called once and called with all provided args', function () {
      expect(success.called).to.equal(false);

      mar.success(3, 2, 1);

      expect(success.calledOnce).to.equal(true);
      expect(success.calledWith(3, 2, 1)).to.equal(true);
    });
  });

});
