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
            test.ifError(err);
            test.equal(p.revisions.length, 2);
            test.equal(p.revisions[1].revision, 2);
            test.equal(p.revisions[1].op, 'u');
            test.done();
        });

    },
};
