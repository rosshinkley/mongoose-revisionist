var mongoose = require('mongoose'),
  util = require('util'),
  async = require('async'),
  _ = require('lodash'),
  logger = require('winston'),
  should = require('should'),
  testUtil = require('../../util');

describe('get versions for instance', function() {
  it('should get versions of a simple model', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.simple(self, cb);
      },
      function(p, cb) {
        p.simple.versions(function(err, versions) {
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
        p.composite.versions(function(err, versions) {
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
        p.composite.versions(function(err, versions) {
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
        p.reference.versions(function(err, versions) {
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

  it('should get versions of a model with a presave', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.presave(self, cb);
      },
      function(p, cb) {
        p.presave.versions(function(err, versions) {
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
});
