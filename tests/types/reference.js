var mongoose = require('mongoose'),
  util = require('util'),
  async = require('async'),
  _ = require('lodash'),
  should = require('should'),
  logger = require('winston'),
  testUtil = require('../util');

describe('reference', function() {
  it('creates', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        var simple = new self.Simple({
          name: 'stuff',
          telephone: '999-999-9999',
          createdBy: 'test'
        });

        simple.save(function(err, simple) {
          cb(err, {
            simple: simple
          });
        });
      },
      function(p, cb) {
        var composite = new self.Composite({
          name: 'stuff',
          telephone: '999-999-9999',
          someCompositeThing: {
            compositeMemberOne: 'one',
            compositeMemberTwo: 'two'
          },
          createdBy: 'test'
        });

        composite.save(function(err, composite) {
          p.composite = composite;
          cb(err, p);
        });
      },
      function(p, cb) {
        var compositeWithArray = new self.CompositeWithArray({
          name: 'stuff',
          telephone: '999-999-9999',
          compositeArray: [{
            arrayMemberOne: 'one',
            arrayMemberTwo: 'two'
          }],
          createdBy: 'test'
        });

        compositeWithArray.save(function(err, compositeWithArray) {
          p.compositeWithArray = compositeWithArray;
          cb(err, p);
        });
      },
      function(p, cb) {
        var reference = new self.Reference({
          name: 'stuff',
          telephone: '999-999-9999',
          createdBy: 'test',
          simple: p.simple,
          composite: p.composite,
          compositeArray: p.compositeWithArray
        });

        reference.save(function(err, reference) {
          p.reference = reference;
          cb(err, p);
        });
      },

      function(p, cb) {
        self.connection.db.collection('revisionists', function(err, revisionistCollection) {
          p.revisionistModel = revisionistCollection;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.revisionistModel.find({
          referenceId: p.reference._id
        })
          .toArray(function(err, revisions) {
            p.revisions = revisions;
            cb(err, p);
          });
      }
    ], function(err, p) {
      if (err) return done(err);
      should(p.revisions)
        .be.ok();
      should(p.revisions[0])
        .be.ok();
      p.revisions.length.should.equal(1);
      p.revisions[0].revision.should.equal(1);
      p.revisions[0].op.should.equal('i');
      done();
    });
  });

  it('updates', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        var simple = new self.Simple({
          name: 'stuff',
          telephone: '999-999-9999',
          createdBy: 'test'
        });

        simple.save(function(err, simple) {
          cb(err, {
            simple: simple
          });
        });
      },
      function(p, cb) {
        var composite = new self.Composite({
          name: 'stuff',
          telephone: '999-999-9999',
          someCompositeThing: {
            compositeMemberOne: 'one',
            compositeMemberTwo: 'two'
          },
          createdBy: 'test'
        });

        composite.save(function(err, composite) {
          p.composite = composite;
          cb(err, p);
        });
      },
      function(p, cb) {
        var compositeWithArray = new self.CompositeWithArray({
          name: 'stuff',
          telephone: '999-999-9999',
          compositeArray: [{
            arrayMemberOne: 'one',
            arrayMemberTwo: 'two'
          }],
          createdBy: 'test'
        });

        compositeWithArray.save(function(err, compositeWithArray) {
          p.compositeWithArray = compositeWithArray;
          cb(err, p);
        });
      },
      function(p, cb) {
        var reference = new self.Reference({
          name: 'stuff',
          telephone: '999-999-9999',
          createdBy: 'test',
          simple: p.simple,
          composite: p.composite,
          compositeArray: p.compositeWithArray
        });

        reference.save(function(err, reference) {
          p.reference = reference;
          cb(err, p);
        });
      },
      function(p, cb) {
        var simple = new self.Simple({
          name: 'stuff',
          telephone: '999-999-9999',
          createdBy: 'test'
        });

        simple.save(function(err, simple) {
          p.simple2 = simple;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.reference.simple = p.simple2;
        p.reference.save(function(err, reference) {
          p.reference = reference;
          cb(err, p);
        });
      },

      function(p, cb) {
        self.connection.db.collection('revisionists', function(err, revisionistCollection) {
          p.revisionistModel = revisionistCollection;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.revisionistModel.find({
          referenceId: p.reference._id
        })
          .toArray(function(err, revisions) {
            p.revisions = revisions;
            cb(err, p);
          });
      }
    ], function(err, p) {
      if (err) return done(err);
      should(p.revisions)
        .be.ok();
      should(p.revisions[1])
        .be.ok();
      p.revisions.length.should.equal(2);
      p.revisions[1].revision.should.equal(2);
      p.revisions[1].op.should.equal('u');
      done();
    });
  });

  it('updates with unset', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.reference(self, cb);
      },
      function(p, cb) {
        //note: for mongo to pick up a $unset from mongoose,
        //note: the member must be explicitly set to undefined.
        //note: setting the member to null will save as null,
        //note: deleting the member will cause the member to be ignored.
        p.reference.composite = undefined;
        p.reference.save(function(err, reference) {
          p.reference = reference;
          cb(err, p);
        });
      },
      function(p, cb) {
        self.connection.db.collection('revisionists', function(err, revisionistCollection) {
          p.revisionistModel = revisionistCollection;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.revisionistModel.find({
          referenceId: p.reference._id
        })
          .toArray(function(err, revisions) {
            p.revisions = revisions;
            cb(err, p);
          });
      }
    ], function(err, p) {
      if (err) return done(err);
      should(p.revisions)
        .be.ok();
      should(p.revisions[3])
        .be.ok();
      should(p.revisions[3].o)
        .be.ok();
      should(p.revisions[3].o['_$unset'])
        .be.ok();
      should(p.revisions[3].o['_$unset'].composite)
        .be.ok();
      p.revisions[3].op.should.equal('u');
      done();
    });
  });
  it('removes', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        testUtil.shorthand.reference(self, cb);
      },
      function(p, cb) {
        p.reference.remove(function(err) {
          cb(err, p)
        });
      },
      function(p, cb) {
        self.connection.db.collection('revisionists', function(err, revisionistCollection) {
          p.revisionistModel = revisionistCollection;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.revisionistModel.find({
          referenceId: p.reference._id
        })
          .toArray(function(err, revisions) {
            p.revisions = revisions;
            cb(err, p);
          });
      },
      function(p, cb) {
        self.Simple.getVersion(p.simple._id, function(err, version) {
          p.v1_byId = version;
          cb(err, p);
        });
      }
    ], function(err, p) {
      if (err) return done(err);
      should(p.revisions)
        .be.ok();
      should(p.revisions[1])
        .be.ok();
      should(p.revisions[2])
        .be.ok();
      should(p.v1_byId)
        .be.ok();


      p.revisions.length.should.equal(5);
      p.revisions[1].revision.should.equal(2);
      p.revisions[4].op.should.equal('d');
      done();
    });
  });
});
