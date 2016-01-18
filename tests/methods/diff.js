var mongoose = require('mongoose'),
    util = require('util'),
    async = require('async'),
    _ = require('lodash'),
    logger = require('winston'),
    should = require('should'),
    testUtil = require('../util');

describe('get diffs by version numbers', function() {
    it('gets a diff of a simple model', function(done) {
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
                p.simple.name = 'baz';
                p.simple.save(function(err, simple) {
                    p.simple = simple;
                    cb(err, p);
                });
            },
            function(p, cb){
                p.simple.diff(3, 4, function(err, diff){
                    p.updateDiff = diff;
                    cb(err, p);
                });
            },
        ], function(err, p) {
            if (err) return done(err);
            should(p.simple).be.ok();
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
                p.composite.someCompositeThing.compositeMemberTwo = 'five';
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
            function(p, cb){
                p.composite.diff(2, 3, function(err, diff){
                    p.updateDiff = diff;
                    cb(err, p);
                })
            }
        ], function(err, p) {
            if (err) return done(err);
            should(p.updateDiff).be.ok();
            p.updateDiff.updated['someCompositeThing.compositeMemberOne'].from.should.equal('three');
            p.updateDiff.updated['someCompositeThing.compositeMemberOne'].to.should.equal('four');
            p.updateDiff.updated['someCompositeThing.compositeMemberOne'].revision.should.equal(3);
            done();
        });

    });
});
