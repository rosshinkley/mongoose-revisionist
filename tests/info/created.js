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
    created: function(test) {
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
            test.ok(p.simple.created);
            test.ok(
                (moment(p.simple.created)
                    .isSame(self.start) || moment(p.simple.created)
                    .isAfter(self.start)) &&
                (moment()
                    .isSame(moment(p.simple.created)) || moment()
                    .isAfter(moment(p.simple.created))));
            test.done();
        });

    },
};
