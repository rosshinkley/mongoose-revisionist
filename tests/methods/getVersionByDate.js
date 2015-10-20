var mongoose = require('mongoose'),
    util = require('util'),
    async = require('async'),
    _ = require('lodash'),
    logger = require('winston'),
    moment = require('moment'),
    should = require('should'),
    testUtil = require('../util');

describe('get versions by date', function() {
    var fixDates = function(item, cb) {
        item.collection.conn.models['Revisionist'].find({
            referenceId: item._id
        })
            .sort({
                ts: -1
            })
            .exec(function(err, revisions) {
                async.parallel(_.map(revisions, function(revision, ix) {
                    return function(cb) {
                        revision.ts = moment(revision.ts)
                            .subtract(ix, 'days');
                        revision.save(function(err) {
                            cb(err);
                        });
                    };
                }), function(err, r) {
                    cb(err);
                });
            });
    };

    it('gets versions of a simple model', function(done) {
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
                fixDates(p.simple, function(err) {
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.simple.getVersion(moment()
                    .subtract(2, 'days'), function(err, version) {
                        p.v1 = version;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                p.simple.getVersion(moment()
                    .subtract(1, 'days'), function(err, version) {
                        p.v2 = version;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.Simple.getVersion(p.simple._id, moment()
                    .subtract(2, 'days'), function(err, version) {
                        p.v1_byId = version;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.Simple.getVersion(p.simple._id, moment()
                    .subtract(1, 'days'), function(err, version) {
                        p.v2_byId = version;
                        cb(err, p);
                    });
            },
        ], function(err, p) {
            if (err) return done(err);
            should(p.simple)
                .be.ok();
            p.simple.revision.should.equal(3);
            should(p.v1)
                .be.ok();
            should(p.v2)
                .be.ok();
            p.v1.name.should.equal('stuff');
            p.v2.name.should.equal('foo');
            should(p.v1_byId)
                .be.ok();
            should(p.v2_byId)
                .be.ok();
            p.v1_byId.name.should.equal('stuff');
            p.v2_byId.name.should.equal('foo');
            done();
        });
    });

    it('gets versions of a composite model', function(done) {
        var self = this;
        async.waterfall([

            function(cb) {
                var composite = new self.Composite({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'test',
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
                fixDates(p.composite, function(err) {
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.composite.getVersion(moment()
                    .subtract(2, 'days'), function(err, v1) {
                        p.v1 = v1;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                p.composite.getVersion(moment()
                    .subtract(1, 'days'), function(err, v2) {
                        p.v2 = v2;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.Composite.getVersion(p.composite._id, moment()
                    .subtract(2, 'days'), function(err, version) {
                        p.v1_byId = version;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.Composite.getVersion(p.composite._id, moment()
                    .subtract(1, 'days'), function(err, version) {
                        p.v2_byId = version;
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
                .be.ok();p
            should(p.v1_byId)
                .be.ok();
            should(p.v1_byId.someCompositeThing)
                .be.ok();
            should(p.v2_byId)
                .be.ok();
            should(p.v2_byId.someCompositeThing)
                .be.ok();

            p.v1.someCompositeThing.compositeMemberOne.should.equal('one');
            p.v2.someCompositeThing.compositeMemberOne.should.equal('three');
            p.v1_byId.someCompositeThing.compositeMemberOne.should.equal('one');
            p.v2_byId.someCompositeThing.compositeMemberOne.should.equal('three');
            done();

        });
    });

    it('gets versions of a composite model with an array', function(done) {
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
                fixDates(p.composite, function(err) {
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.composite.getVersion(moment()
                    .subtract(2, 'days'), function(err, v1) {
                        p.v1 = v1;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                p.composite.getVersion(moment()
                    .subtract(1, 'days'), function(err, v2) {
                        p.v2 = v2;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.CompositeWithArray.getVersion(p.composite._id, moment()
                    .subtract(2, 'days'), function(err, version) {
                        p.v1_byId = version;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.CompositeWithArray.getVersion(p.composite._id, moment()
                    .subtract(1, 'days'), function(err, version) {
                        p.v2_byId = version;
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
            should(p.v1_byId)
                .be.ok();
            should(p.v1_byId.compositeArray)
                .be.ok();
            should(p.v1_byId.compositeArray[0])
                .be.ok();
            should(p.v2_byId)
                .be.ok();
            should(p.v2_byId.compositeArray)
                .be.ok();
            should(p.v2_byId.compositeArray[0])
                .be.ok();

            p.v1.compositeArray[0].arrayMemberOne.should.equal('one');
            p.v2.compositeArray[0].arrayMemberOne.should.equal('three');
            p.v1_byId.compositeArray[0].arrayMemberOne.should.equal('one');
            p.v2_byId.compositeArray[0].arrayMemberOne.should.equal('three');

            done();
        });
    });

    it('gets version of a model with a reference', function(done) {
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
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    createdBy: 'test'
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
                fixDates(p.reference, function(err) {
                    cb(err, p);
                });
            },
            function(p, cb) {
                p.reference.getVersion(moment()
                    .subtract(2, 'days'), function(err, v1) {
                        p.v1 = v1;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                p.reference.getVersion(moment()
                    .subtract(1, 'days'), function(err, v2) {
                        p.v2 = v2;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.Reference.getVersion(p.reference._id, moment()
                    .subtract(2, 'days'), function(err, version) {
                        p.v1_byId = version;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.Reference.getVersion(p.reference._id, moment()
                    .subtract(1, 'days'), function(err, version) {
                        p.v2_byId = version;
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
            should(p.v1_byId)
                .be.ok();
            should(p.v1_byId.simple)
                .be.ok();
            should(p.v2_byId)
                .be.ok();
            should(p.v2_byId.simple)
                .be.ok();

            p.v1.simple.toString()
                .should.equal(p.simple._id.toString());
            p.v2.simple.toString()
                .should.equal(p.simple2._id.toString());
            p.v1_byId.simple.toString()
                .should.equal(p.simple._id.toString());
            p.v2_byId.simple.toString()
                .should.equal(p.simple2._id.toString());
            done();
        });

    });

    it('should be able to handle a bad future date', function(done) {
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
                p.simple.getVersion(moment()
                    .add(1, 'year'), function(err, version) {
                        p.v1 = version;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.Simple.getVersion(p.simple._id, moment()
                    .add(1, 'year'), function(err, version) {
                        p.v1_byId = version;
                        cb(err, p);
                    });
            },
        ], function(err, p) {
            if (err) return done(err);
            should(p.simple)
                .be.ok();
            should(p.v1)
                .be.ok();
            should(p.v1_byId)
                .be.ok();
            p.simple.revision.should.equal(3);
            p.v1.name.should.equal('bar');
            p.v1_byId.name.should.equal('bar');
            done();
        });
    });

    it('should be able to handle as bad past date', function(done) {
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
                p.simple.getVersion(moment()
                    .subtract(1, 'year'), function(err, version) {
                        p.v1 = version;
                        cb(err, p);
                    });
            },
            function(p, cb) {
                self.Simple.getVersion(p.simple._id, moment()
                    .subtract(1, 'year'), function(err, version) {
                        p.v1_byId = version;
                        cb(err, p);
                    });
            },
        ], function(err, p) {
            if (err) return done(err);
            should(p.simple)
                .be.ok();
            should(p.v1)
                .be.not.ok();
            should(p.v1_byId)
                .be.not.ok();
            p.simple.revision.should.equal(3);
            done();

        });
    });
});
