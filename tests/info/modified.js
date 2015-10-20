var mongoose = require('mongoose'),
    util = require('util'),
    async = require('async'),
    should = require('should'),
    _ = require('lodash'),
    logger = require('winston'),
    moment = require('moment'),
    testUtil = require('../util');

describe('modified', function() {
    beforeEach(function(done) {
        this.start = moment();
        done();
    });

    it('should have a modified time', function(done) {
        var self = this;
        self.timeout(0);
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

            if (err) return done(err);
            should(p.simple)
                .be.ok();
            should(p.simple.modified)
                .be.ok();
            should((moment(p.simple.modified)
                    .isSame(self.start) || moment(p.simple.modified)
                    .isAfter(self.start)) &&
                (moment()
                    .isSame(moment(p.simple.modified)) || moment()
                    .isAfter(moment(p.simple.modified)))).be.ok();
            moment(p.simple.modified).diff(self.start, 'seconds').should.equal(3);
            moment(p.simple.modified).diff(p.simple.created, 'seconds').should.equal(6);
            done();
        });
    });
});
