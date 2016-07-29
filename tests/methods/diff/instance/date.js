var mongoose = require('mongoose'),
  util = require('util'),
  async = require('async'),
  _ = require('lodash'),
  moment = require('moment'),
  logger = require('winston'),
  should = require('should'),
  testUtil = require('../../../util');

describe('get diffs by version dates', function() {

    it('gets a diff of a simple model', function(done) {
      var self = this;
      async.waterfall([

        function(cb) {
          testUtil.shorthand.simple(self, cb);
        },
        function(p, cb) {
          p.simple.diff(moment()
            .subtract(1, 'days')
            .startOf('day'), moment()
            .subtract(0, 'days')
            .endOf('day'), function(err, diff) {
              p.updateDiff = diff;
              cb(err, p);
            });
        },
      ], function(err, p) {
        if (err) return done(err);
        should(p.updateDiff)
          .be.ok();
        p.updateDiff.updated.name.from.should.equal('bar');
        p.updateDiff.updated.name.to.should.equal('baz');
        p.updateDiff.updated.name.revision.should.equal(4);
        done();
      });
    });

  it('gets a diff of a composite model', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.composite(self, cb);
      },
      function(p, cb) {
        p.composite.diff(moment()
          .subtract(1, 'days')
          .startOf('day'), moment()
          .subtract(0, 'days')
          .endOf('day'), function(err, diff) {
            p.updateDiff = diff;
            cb(err, p);
          })
      }
    ], function(err, p) {
      if (err) return done(err);
      should(p.updateDiff)
        .be.ok();
      p.updateDiff.updated['someCompositeThing.compositeMemberOne'].from.should.equal('three');
      p.updateDiff.updated['someCompositeThing.compositeMemberOne'].to.should.equal('four');
      p.updateDiff.updated['someCompositeThing.compositeMemberOne'].revision.should.equal(3);
      done();
    });

  });

  it('gets a diff of a composite model with an array', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.compositeWithArray(self, cb);
      },
      function(p, cb) {
        p.composite.diff(moment()
          .subtract(1, 'days')
          .startOf('day'), moment()
          .subtract(0, 'days')
          .endOf('day'), function(err, diff) {
            p.updateDiff = diff;
            cb(err, p);
          });
      }
    ], function(err, p) {
      if (err) return done(err);
      p.updateDiff.updated['compositeArray.0.arrayMemberOne'].from.should.equal('three');
      p.updateDiff.updated['compositeArray.0.arrayMemberOne'].to.should.equal('four');
      p.updateDiff.updated['compositeArray.0.arrayMemberOne'].revision.should.equal(3);
      done();
    });

  });

  it('gets a diff of a model with a reference', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.reference(self, cb);
      },
      function(p, cb) {
        p.reference.diff(moment()
          .subtract(1, 'days')
          .startOf('day'), moment()
          .subtract(0, 'days')
          .endOf('day'), function(err, diff) {
            p.updateDiff = diff;
            cb(err, p);
          });
      }
    ], function(err, p) {
      if (err) return done(err);
      p.updateDiff.updated['simple'].from.should.equal(p.simple2.id.toString());
      p.updateDiff.updated['simple'].to.should.equal(p.simple3.id.toString());
      p.updateDiff.updated['simple'].revision.should.equal(3);

      done();
    });
  });

  it('gets a diff of a model with a presave hook', function(done) {
      var self = this;
      async.waterfall([

        function(cb) {
          testUtil.shorthand.presave(self, cb);
        },
        function(p, cb) {
          p.presave.diff(moment()
            .subtract(1, 'days')
            .startOf('day'), moment()
            .subtract(0, 'days')
            .endOf('day'), function(err, diff) {
              p.updateDiff = diff;
              cb(err, p);
            });
        },
      ], function(err, p) {
        if (err) return done(err);
        should(p.updateDiff)
          .be.ok();
        p.updateDiff.updated.name.from.should.equal('bar');
        p.updateDiff.updated.name.to.should.equal('baz');
        p.updateDiff.updated.name.revision.should.equal(4);
        p.updateDiff.updated.someNumber.to.should.equal(4);
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
        p.simple.diff(moment()
          .subtract(100, 'days')
          .startOf('day'), moment()
          .subtract(99, 'days')
          .endOf('day'), function(err, diff) {
            p.updateDiff = diff;
            cb(err, p);
          });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.updateDiff)
        .not.be.ok();
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
        p.simple.diff(moment()
          .add(100, 'days')
          .startOf('day'), moment()
          .add(199, 'days')
          .endOf('day'), function(err, diff) {
            p.updateDiff = diff;
            cb(err, p);
          });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.updateDiff)
        .not.be.ok();
      done();
    });
  });
});
