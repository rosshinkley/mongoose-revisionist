var mongoose = require('mongoose'),
    util = require('util'),
    async = require('async'),
    _ = require('lodash'),
    logger = require('winston'),
    testUtil = require('../util');

module.exports = exports = {
    setUp: function(cb) {
        testUtil.setup(this);
        cb();
    },
    tearDown: function(cb) {
        this.connection.close();
        cb();

    },
    create: function(test) {
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
                self.connection.db.collection('revisionists', function(err, revisionistCollection) {
                    p.revisionistModel = revisionistCollection;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.revisionistModel.find({
                    referenceId: p.simple._id
                })
                    .toArray(function(err, revisions) {
                        p.revisions = revisions;
                        cb(err, p);
                    });
            }
        ], function(err, p) {
            test.ifError(err);
            test.equal(p.revisions.length, 1);
            test.equal(p.revisions[0].revision, 1);
            test.equal(p.revisions[0].op, 'i');
            test.done();
        });

    },
    update: function(test) {
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
                p.simple.name = 'more stuff';
                p.simple.modifiedBy = 'test';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
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
                    referenceId: p.simple._id
                })
                    .toArray(function(err, revisions) {
                        p.revisions = revisions;
                        cb(err, p);
                    });
            }
        ], function(err, p) {
            test.ifError(err);
            test.equal(p.revisions.length, 2);
            test.equal(p.revisions[1].revision, 2);
            test.equal(p.revisions[1].op, 'u');
            test.equal(p.revisions[1].o['_$set'].name, 'more stuff');
            test.done();
        });

    },
    'update with unset': function(test) {
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
                //note: for mongo to pick up a $unset from mongoose,
                //note: the member must be explicitly set to undefined.
                //note: setting the member to null will save as null,
                //note: deleting the member will cause the member to be ignored.
                p.simple.telephone = undefined;
                p.simple.save(function(err, simple) {
                    p.simple = simple;
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
                    referenceId: p.simple._id
                })
                    .toArray(function(err, revisions) {
                        p.revisions = revisions;
                        cb(err, p);
                    });
            }
        ], function(err, p) {
            test.ifError(err);
            test.equal(p.revisions.length, 2);
            test.equal(p.revisions[1].revision, 2);
            test.ok(p.revisions[1].o['_$unset'].telephone);
            test.equal(p.revisions[1].op, 'u');
            test.done();
        });

    },
    remove: function(test) {
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
                p.simple.modifiedBy = 'remove test';
                p.simple.remove(function(err){
                    cb(err,p)
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
                    referenceId: p.simple._id
                })
                    .toArray(function(err, revisions) {
                        p.revisions = revisions;
                        cb(err, p);
                    });
            },
            function(p, cb){
                self.Simple.getVersion(p.simple._id, function(err, version){
                    p.v1_byId = version;
                    cb(err, p);
                });
            }
        ], function(err, p) {
            test.ifError(err);
            test.equal(p.revisions.length, 3);
            test.equal(p.revisions[1].revision, 2);
            test.equal(p.revisions[2].op, 'd');
            test.ok(p.v1_byId);
            test.equal(p.v1_byId.modifiedBy, 'remove test');
            test.done();
        });
    }
};
