var mongoose = require('mongoose'),
    util = require('util'),
    async = require('async'),
    _ = require('lodash'),
    logger = require('winston'),
    moment = require('moment'),
    testUtil = require('../util');

module.exports = exports = {
    setUp: function(cb) {
        var self = this;
        self.start = moment();
        testUtil.setup(self);
        cb();
    },
    tearDown: function(cb) {
        this.connection.close();
        cb();

    },
    modified: function(test) {
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
                setTimeout(function() {
                    self.start = moment();
                    cb(null, p);
                }, 3000);
            },
            function(p, cb) {
                setTimeout(function() {
                    p.simple.name = 'foo';
                    p.simple.save(function(err) {
                        cb(err, p);
                    });
                }, 3000);
            }
        ], function(err, p) {
            test.ifError(err);
            test.ok(p.simple.modified);
            test.ok(
                (moment(p.simple.modified)
                    .isSame(self.start) || moment(p.simple.modified)
                    .isAfter(self.start)) &&
                (moment()
                    .isSame(moment(p.simple.modified)) || moment()
                    .isAfter(moment(p.simple.modified))));
            test.equal(moment(p.simple.modified).diff(self.start, 'seconds'), 3);
            test.equal(moment(p.simple.modified).diff(moment(p.simple.created), 'seconds'), 6);
            test.done();
        });

    },
};
