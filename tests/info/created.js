var mongoose = require('mongoose'),
    util = require('util'),
    async = require('async'),
    _ = require('lodash'),
    logger = require('winston'),
    moment = require('moment'),
    should = require('should'),
    testUtil = require('../util');

describe('created', function() {
    beforeEach(function(done) {
        this.start = moment();
        done();
    });

    it('should have a created time', function(done) {
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
            should(p.simple.created)
                .be.ok();
            should((moment(p.simple.created)
                    .isSame(self.start) || moment(p.simple.created)
                    .isAfter(self.start)) &&
                (moment()
                    .isSame(moment(p.simple.created)) || moment()
                    .isAfter(moment(p.simple.created))))
                .be.ok();
            done();
        });
    })
});
