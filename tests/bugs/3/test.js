var mongoose = require('mongoose'),
  util = require('util'),
  async = require('async'),
  should = require('should'),
  _ = require('lodash'),
  logger = require('winston'),
  moment = require('moment'),
  testUtil = require('../../util');

describe('modified', function() {
  beforeEach(function(done) {
    this.start = moment();
    done();
  });

  it('should fix #3', function(done) {
    var self = this;
    self.timeout(0);
    var Model = self.connection.model('mr3', require('./schema'));
    async.waterfall([

      function(cb) {
        var model = new Model({
          hashtag: '#test',
          title: 'test',
          center: 'test',
          created_by: {
            id: 'test',
            name: 'test'
          },
          type:'test',

        });

        model.save(function(err, simple) {
          cb(err, {
            model: model
          });
        });
      },
    ], function(err, p) {

      if (err) return done(err);
      console.dir(p)
      done();
    });
  });
});
