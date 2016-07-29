var async = require('async'),
  fixDates = require('../fixDates');
module.exports = exports = function(self, cb) {
  async.waterfall([
    function(cb) {
      var subdocument = new self.Subdocument({
        name: 'stuff',
        embedded:[{name: 'embedded stuff'}],
        createdBy: 'ross'
      });
      subdocument.save(function(err, subdocument) {
        cb(err, {
          subdocument: subdocument
        });
      });
    },
    function(p, cb) {
      p.subdocument.name = 'foo';
      p.subdocument.embedded[0].name = 'embedded foo';
      p.subdocument.save(function(err, subdocument) {
        p.subdocument = subdocument;
        cb(err, p);
      });
    },
    function(p, cb) {
      p.subdocument.name = 'bar';
      p.subdocument.embedded[0].name = 'embedded bar';
      p.subdocument.save(function(err, subdocument) {
        p.subdocument = subdocument;
        cb(err, p);
      });
    },
    function(p, cb) {
      p.subdocument.name = 'baz';
      p.subdocument.embedded[0].name = 'embedded baz';
      p.subdocument.save(function(err, subdocument) {
        p.subdocument = subdocument;
        cb(err, p);
      });
    },
    function(p, cb) {
      fixDates(p.subdocument, function(err) {
        cb(err, p);
      });
    }
  ], function(err, p) {
    cb(err, p);
  });
};
