var mongoose = require('mongoose'),
    util = require('util'),
    async = require('async'),
    should =require('should'),
    _ = require('lodash'),
    logger = require('winston'),
    testUtil = require('../util');


describe('modified by', function() {
    it('should have a modified by', function(done) {
        var self = this;
        async.waterfall([

            function(cb) {
                var simple = new self.Simple({
                    name: 'stuff',
                    telephone: '999-999-9999',
                    modifiedBy: 'test'
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
            should(p.simple.modifiedBy)
                .be.ok();
            p.simple.modifiedBy.should.equal('test');
            p.simple.modifiedBy.should.equal(p.simple.modifiedBy);
            done();
        });
    });

    it('should automatically assign unknown if no modified by is specified', function(done) {
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
            should(p.simple.modifiedBy)
                .be.ok();
            p.simple.modifiedBy.should.equal('[unknown]');
            p.simple.modifiedBy.should.equal(p.simple.modifiedBy);
            done();
        });
    });
});
