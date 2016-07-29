var async = require('async'),
  fixDates = require('../fixDates');
module.exports = exports = function(self, cb) {
  async.waterfall([
    function(cb) {
      var presave = new self.Presave({
        name: 'stuff',
        telephone: '999-999-9999',
        createdBy: 'ross'
      });

      presave.save(function(err, presave) {
        cb(err, {
          presave: presave
        });
      });
    },
    function(p, cb) {
      p.presave.name = 'foo';
      p.presave.save(function(err, presave) {
        p.presave = presave;
        cb(err, p);
      });
    },
    function(p, cb) {
      p.presave.name = 'bar';
      p.presave.save(function(err, presave) {
        p.presave = presave;
        cb(err, p);
      });
    },
    function(p, cb) {
      p.presave.name = 'baz';
      p.presave.save(function(err, presave) {
        p.presave = presave;
        cb(err, p);
      });
    },
    function(p, cb) {
      fixDates(p.presave, function(err) {
        cb(err, p);
      });
    }
  ], function(err, p) {
    cb(err, p);
  });
};
