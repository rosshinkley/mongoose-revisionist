var mongoose = require('mongoose'),
  util = require('util'),
  async = require('async'),
  _ = require('lodash'),
  logger = require('winston'),
  should = require('should'),
  testUtil = require('../../../util');

describe('get versions by version number', function() {
  it('gets versions of a simple model', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.simple(self, cb);
      },
      function(p, cb) {
        p.simple.getVersion(1, function(err, version) {
          p.v1 = version;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.simple.getVersion(2, function(err, version) {
          p.v2 = version;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.simple)
        .be.ok();
      p.simple.revision.should.equal(4);
      should(p.v1)
        .be.ok();
      should(p.v2)
        .be.ok();
      p.v1.name.should.equal('stuff');
      p.v2.name.should.equal('foo');
      done();
    });
  });

  it('gets versions of a composite model', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.composite(self, cb);
      },
      function(p, cb) {
        p.composite.getVersion(1, function(err, v1) {
          p.v1 = v1;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.composite.getVersion(2, function(err, v2) {
          p.v2 = v2;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.v1)
        .be.ok();
      should(p.v1.someCompositeThing)
        .be.ok();
      should(p.v2)
        .be.ok();
      should(p.v2.someCompositeThing)
        .be.ok();

      p.v1.someCompositeThing.compositeMemberOne.should.equal('one');
      p.v2.someCompositeThing.compositeMemberOne.should.equal('three');
      done();
    });

  });

  it('gets versions of a composite model with an array', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.compositeWithArray(self, cb);
      },
      function(p, cb) {
        p.composite.getVersion(1, function(err, v1) {
          p.v1 = v1;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.composite.getVersion(2, function(err, v2) {
          p.v2 = v2;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.v1)
        .be.ok();
      should(p.v1.compositeArray)
        .be.ok();
      should(p.v1.compositeArray[0])
        .be.ok();
      should(p.v2)
        .be.ok();
      should(p.v2.compositeArray)
        .be.ok();
      should(p.v2.compositeArray[0])
        .be.ok();

      p.v1.compositeArray[0].arrayMemberOne.should.equal('one');
      p.v2.compositeArray[0].arrayMemberOne.should.equal('three');

      done();
    });

  });

  it('gets versions of a model with a reference', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.reference(self, cb);
      },
      function(p, cb) {
        p.reference.getVersion(1, function(err, v1) {
          p.v1 = v1;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.reference.getVersion(2, function(err, v2) {
          p.v2 = v2;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.v1)
        .be.ok();
      should(p.v1.simple)
        .be.ok();
      should(p.v2)
        .be.ok();
      should(p.v2.simple)
        .be.ok();

      p.v1.simple.toString()
        .should.equal(p.simple._id.toString());
      p.v2.simple.toString()
        .should.equal(p.simple2._id.toString());
      done();
    });
  });

  it('should get the current version with current specified', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.simple(self, cb);
      },
      function(p, cb) {
        p.simple.getVersion('current', function(err, version) {
          p.v1 = version;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.simple)
        .be.ok();
      should(p.v1)
        .be.ok();
      p.simple.revision.should.equal(4);
      p.v1.name.should.equal('baz');
      done();
    });
  });

  it('should get the current version if no version is specified', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.simple(self, cb);
      },
      function(p, cb) {
        p.simple.getVersion(function(err, version) {
          p.v1 = version;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.simple)
        .be.ok();
      should(p.v1)
        .be.ok();
      p.simple.revision.should.equal(4);
      p.v1.name.should.equal('baz');
      done();
    });
  });

  it('should handle a bad future version', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.simple(self, cb);
      },
      function(p, cb) {
        p.simple.getVersion(9, function(err, version) {
          p.v1 = version;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.simple)
        .be.ok();
      should(p.v1)
        .be.ok();
      p.simple.revision.should.equal(4);
      p.v1.name.should.equal('baz');
      done();
    });
  });

  it('should handle a bad past version', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.simple(self, cb);
      },
      function(p, cb) {
        p.simple.getVersion(-1, function(err, version) {
          p.v1 = version;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.simple)
        .be.ok();
      should(p.v1)
        .be.not.ok();
      p.simple.revision.should.equal(4);
      done();
    });
  });
});
