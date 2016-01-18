var async = require('async'),
  fixDates = require('../fixDates');
module.exports = exports = function(self, cb) {
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
    function(p, cb) {
      fixDates(p.simple, function(err) {
        cb(err, p);
      });
    }
  ], function(err, p) {
    cb(err, p);
  });
};
