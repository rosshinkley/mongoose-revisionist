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
    simple: function(test) {
        var self = this;
        async.waterfall([

            function(cb) {
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'ross'
                });

                simple.save(function(err, simple) {
                    cb(err, {
                        simple: simple
                    });
                });
            },
            function(p, cb) {
                p.simple.name = 'foo';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.name = 'bar';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
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
            function(p, cb) {
                self.Simple.getVersion(p.simple._id, 1, function(err, version) {
                    p.v1_byId = version;
                    cb(err, p);
                });
            },
            function(p, cb) {
                self.Simple.getVersion(p.simple._id, 2, function(err, version) {
                    p.v2_byId = version;
                    cb(err, p);
                });
            },

        ], function(err, p) {
            test.ifError(err);
            test.equal(p.simple.revision, 3);
            test.equal(p.v1.name, 'stuff');
            test.equal(p.v2.name, 'foo');
            test.equal(p.v1_byId.name, 'stuff');
            test.equal(p.v2_byId.name, 'foo');
            test.done();
        });

    },
    composite: function(test) {
        var self = this;
        async.waterfall([

            function(cb) {
                var composite = new self.Composite({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'ross',
                    someCompositeThing: {
                        compositeMemberOne: 'one',
                        compositeMemberTwo: 'two'
                    },
                });
                composite.save(function(err, composite) {
                    cb(err, {
                        composite: composite
                    });
                });
            },
            function(p, cb) {
                p.composite.someCompositeThing.compositeMemberOne = 'three';
                p.composite.save(function(err, composite) {
                    p.composite = composite;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.composite.someCompositeThing.compositeMemberOne = 'four';
                p.composite.save(function(err, composite) {
                    p.composite = composite;
                    cb(err, p);
                });
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
            function(p, cb) {
                self.Composite.getVersion(p.composite._id, 1, function(err, v1) {
                    p.v1_byId = v1;
                    cb(err, p);
                });
            },
            function(p, cb) {
                self.Composite.getVersion(p.composite._id, 2, function(err, v2) {
                    p.v2_byId = v2;
                    cb(err, p);
                });
            }

        ], function(err, p) {
            test.ifError(err);
            test.equal(p.v1.someCompositeThing.compositeMemberOne, 'one');
            test.equal(p.v2.someCompositeThing.compositeMemberOne, 'three');
            test.equal(p.v1_byId.someCompositeThing.compositeMemberOne, 'one');
            test.equal(p.v2_byId.someCompositeThing.compositeMemberOne, 'three');

            test.done();
        });

    },
    'composite with array': function(test) {
        var self = this;
        async.waterfall([

            function(cb) {
                var composite = new self.CompositeWithArray({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'ross',
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
                p.composite.save(function(err, composite) {
                    p.composite = composite;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.composite.compositeArray[0].arrayMemberOne = 'four';
                p.composite.save(function(err, composite) {
                    p.composite = composite;
                    cb(err, p);
                });
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
            function(p, cb) {
                self.CompositeWithArray.getVersion(p.composite._id, 1, function(err, v1) {
                    p.v1_byId = v1;
                    cb(err, p);
                });
            },
            function(p, cb) {
                self.CompositeWithArray.getVersion(p.composite._id, 2, function(err, v2) {
                    p.v2_byId = v2;
                    cb(err, p);
                });
            },
        ], function(err, p) {
            test.ifError(err);
            test.equal(p.v1.compositeArray[0].arrayMemberOne, 'one');
            test.equal(p.v2.compositeArray[0].arrayMemberOne, 'three');
            test.equal(p.v1_byId.compositeArray[0].arrayMemberOne, 'one');
            test.equal(p.v2_byId.compositeArray[0].arrayMemberOne, 'three');
            test.done();
        });

    },
    reference: function(test) {
        var self = this;
        async.waterfall([

            function(cb) {
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'ross'
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
                    createdBy: 'ross'
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
                    createdBy: 'ross'
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
                    simple: p.simple,
                    composite: p.composite,
                    compositeArray: p.compositeWithArray,
                    createdBy: 'test'
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
                    createdBy: 'ross'
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
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'ross'
                });

                simple.save(function(err, simple) {
                    p.simple3 = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.reference.simple = p.simple3;
                p.reference.save(function(err, reference) {
                    p.reference = reference;
                    cb(err, p);
                });
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
            function(p, cb) {
                self.Reference.getVersion(p.reference._id, 1, function(err, v1) {
                    p.v1_byId = v1;
                    cb(err, p);
                });
            },
            function(p, cb) {
                self.Reference.getVersion(p.reference._id, 2, function(err, v2) {
                    p.v2_byId = v2;
                    cb(err, p);
                });
            }

        ], function(err, p) {
            test.ifError(err);
            test.equal(p.v1.simple.toString(), p.simple._id.toString());
            test.equal(p.v2.simple.toString(), p.simple2._id.toString());
            test.equal(p.v1_byId.simple.toString(), p.simple._id.toString());
            test.equal(p.v2_byId.simple.toString(), p.simple2._id.toString());


            test.done();
        });

    },
    'current, passed': function(test) {
        var self = this;
        async.waterfall([

            function(cb) {
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'ross'
                });

                simple.save(function(err, simple) {
                    cb(err, {
                        simple: simple
                    });
                });
            },
            function(p, cb) {
                p.simple.name = 'foo';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.name = 'bar';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.getVersion('current', function(err, version) {
                    p.v1 = version;
                    cb(err, p);
                });
            },
        ], function(err, p) {
            test.ifError(err);
            test.equal(p.simple.revision, 3);
            test.equal(p.v1.name, 'bar');
            test.done();
        });

    },
    'current, no argument': function(test) {
        var self = this;
        async.waterfall([

            function(cb) {
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'ross'
                });

                simple.save(function(err, simple) {
                    cb(err, {
                        simple: simple
                    });
                });
            },
            function(p, cb) {
                p.simple.name = 'foo';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.name = 'bar';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.getVersion(function(err, version) {
                    p.v1 = version;
                    cb(err, p);
                });
            },
        ], function(err, p) {
            test.ifError(err);
            test.equal(p.simple.revision, 3);
            test.equal(p.v1.name, 'bar');
            test.done();
        });

    },
    'bad future version': function(test) {
        var self = this;
        async.waterfall([

            function(cb) {
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'ross'
                });

                simple.save(function(err, simple) {
                    cb(err, {
                        simple: simple
                    });
                });
            },
            function(p, cb) {
                p.simple.name = 'foo';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.name = 'bar';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.getVersion(9, function(err, version) {
                    p.v1 = version;
                    cb(err, p);
                });
            },
        ], function(err, p) {
            test.ifError(err);
            test.equal(p.simple.revision, 3);
            test.equal(p.v1.name, 'bar');
            test.done();
        });

    },
    'bad past version': function(test) {
        var self = this;
        async.waterfall([

            function(cb) {
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'ross'
                });

                simple.save(function(err, simple) {
                    cb(err, {
                        simple: simple
                    });
                });
            },
            function(p, cb) {
                p.simple.name = 'foo';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.name = 'bar';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.getVersion(-1, function(err, version) {
                    p.v1 = version;
                    cb(err, p);
                });
            },
        ], function(err, p) {
            test.ifError(err);
            test.equal(p.simple.revision, 3);
            test.ok(!p.v1);
            test.done();
        });

    },
};
