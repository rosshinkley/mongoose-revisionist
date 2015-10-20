var mongoose = require('mongoose'),
    util = require('util'),
    async = require('async'),
    _ = require('lodash'),
    logger = require('winston'),
    should = require('should'),
    testUtil = require('../util');


describe('created by', function() {
    it('should have a created by', function(done) {
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
        ], function(err, p) {
            if (err) return done(err);
            should(p.simple)
                .be.ok();
            should(p.simple.createdBy)
                .be.ok();
            p.simple.createdBy.should.equal('test');
            p.simple.createdBy.should.equal(p.simple.modifiedBy);
            done();
        });
    });

    it('should automatically assign unknown if no created by is specified', function(done) {
        var self = this;
        async.waterfall([

            function(cb) {
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                });

                simple.save(function(err, simple) {
                    cb(err, {
                        simple: simple
                    });
                });
            },
        ], function(err, p) {
            if (err) return done(err);
            should(p.simple)
                .be.ok();
            should(p.simple.createdBy)
                .be.ok();
            p.simple.createdBy.should.equal('[unknown]');
            p.simple.createdBy.should.equal(p.simple.modifiedBy);
            done();
        });
    });
});
