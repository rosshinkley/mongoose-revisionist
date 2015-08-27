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
    createdBy: function(test) {
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
            test.ifError(err);
            test.ok(p.simple.createdBy);
            test.ok(p.simple.modifiedBy);
            test.equal(p.simple.createdBy, 'test');
            test.equal(p.simple.createdBy, p.simple.modifiedBy);
            test.done();
        });

    },
    'createdBy not set': function(test) {
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
            test.ifError(err);
            test.ok(p.simple.createdBy);
            test.ok(p.simple.modifiedBy);
            test.equal(p.simple.createdBy, '[unknown]');
            test.equal(p.simple.createdBy, p.simple.modifiedBy);
            test.done();
        });

    },
};
