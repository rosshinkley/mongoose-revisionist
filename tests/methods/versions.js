var mongoose = require('mongoose'),
    util = require('util'),
    async = require('async'),
    _ = require('lodash'),
    logger = require('winston'),
    should = require('should'),
    testUtil = require('../util');

describe('versions', function() {
    it('should get versions of a simple model', function(done) {
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
                p.simple.versions(function(err, versions) {
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

    it('should get versions of a composite model', function(done) {
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

    it('should get versions of a composite model with an array', function(done){
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

    it('should get versions of a model with a reference', function(done){
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
});
