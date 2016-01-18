var mongoose = require('mongoose'),
  util = require('util'),
  async = require('async'),
  _ = require('lodash'),
  should = require('should'),
  logger = require('winston'),
  testUtil = require('../util');

describe('composite with array', function() {
  it('creates', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        var composite = new self.CompositeWithArray({
          name: 'stuff',
          telephone: '999-999-9999',
          compositeArray: [{
            arrayMemberOne: 'one',
            arrayMemberTwo: 'two'
          }],
          createdBy: 'test'
        });

        composite.save(function(err, composite) {
          cb(err, {
            composite: composite
          });
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
          referenceId: p.composite._id
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
        var composite = new self.CompositeWithArray({
          name: 'stuff',
          telephone: '999-999-9999',
          createdBy: 'test',
          compositeArray: [{
            arrayMemberOne: 'one',
            arrayMemberTwo: 'two'
          }],
        });

        composite.save(function(err, composite) {
          cb(err, {
            composite: composite
          });
        });
      },
      function(p, cb) {
        p.composite.compositeArray[0].arrayMemberOne = 'three';
        p.composite.modifiedBy = 'test';
        p.composite.save(function(err, composite) {
          p.composite = composite;
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
          referenceId: p.composite._id
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
      p.revisions[1].o['_$set'].compositeArray[0].arrayMemberOne.should.equal('three');
      done();
    });
  });

  it('updates with unset', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        var composite = new self.CompositeWithArray({
          name: 'stuff',
          telephone: '999-999-9999',
          createdBy: 'test',
          compositeArray: [{
            arrayMemberOne: 'one',
            arrayMemberTwo: 'two'
          }],
        });

        composite.save(function(err, composite) {
          cb(err, {
            composite: composite
          });
        });
      },
      function(p, cb) {
        //note: for mongo to pick up a $unset from mongoose,
        //note: the member must be explicitly set to undefined.
        //note: setting the member to null will save as null,
        //note: deleting the member will cause the member to be ignored.
        p.composite.compositeArray[0].arrayMemberTwo = undefined;
        p.composite.save(function(err, composite) {
          p.composite = composite;
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
          referenceId: p.composite._id
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
      should(p.revisions[1].o)
        .be.ok();
      should(p.revisions[1].o['_$unset'])
        .be.ok();
      should(p.revisions[1].o['_$unset'].compositeArray)
        .be.ok();
      should(p.revisions[1].o['_$unset'].compositeArray[0].arrayMemberTwo)
        .be.ok();
      p.revisions[1].op.should.equal('u');
      done();
    });
  });

  it('removes', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        var composite = new self.CompositeWithArray({
          name: 'stuff',
          telephone: '999-999-9999',
          createdBy: 'test',
          compositeArray: {
            arrayMemberOne: 'one',
            arrayMemberTwo: 'two'
          },
        });

        composite.save(function(err, composite) {
          cb(err, {
            composite: composite
          });
        });
      },
      function(p, cb) {
        p.composite.remove(function(err) {
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
          referenceId: p.composite._id
        })
          .toArray(function(err, revisions) {
            p.revisions = revisions;
            cb(err, p);
          });
      },
      function(p, cb) {
        self.CompositeWithArray.getVersion(p.composite._id, function(err, version) {
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

      p.revisions.length.should.equal(3);
      p.revisions[1].revision.should.equal(2);
      p.revisions[2].op.should.equal('d');
      done();
    });
  });
});
