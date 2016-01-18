var mongoose = require('mongoose'),
  util = require('util'),
  async = require('async'),
  _ = require('lodash'),
  logger = require('winston'),
  should = require('should'),
  testUtil = require('../../util');

describe('get versions usinng static method', function() {
  it('should get versions of a simple model', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.simple(self, cb);
      },
      function(p, cb) {
        self.Simple.versions(p.simple.id, function(err, versions) {
          p.versions = versions;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.versions)
        .be.ok();
      p.versions.length.should.equal(4);
      done();
    });
  });

  it('should get versions of a composite model', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.composite(self, cb);
      },
      function(p, cb) {
        self.Composite.versions(p.composite.id, function(err, versions) {
          p.versions = versions;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.versions)
        .be.ok();
      p.versions.length.should.equal(3);
      done();
    });
  });

  it('should get versions of a composite model with an array', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.compositeWithArray(self, cb);
      },
      function(p, cb) {
        self.CompositeWithArray.versions(p.composite.id, function(err, versions) {
          p.versions = versions;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.versions)
        .be.ok();
      p.versions.length.should.equal(3);
      done();
    });
  });

  it('should get versions of a model with a reference', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.reference(self, cb);
      },
      function(p, cb) {
        self.Reference.versions(p.reference.id, function(err, versions){
          p.versions = versions;
          cb(err, p);
        });
      }

    ], function(err, p) {
      if (err) return done(err);
      should(p.versions)
        .be.ok();
      p.versions.length.should.equal(3);
      done();
    });
  });
});
