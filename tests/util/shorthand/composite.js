var async = require('async'),
  fixDates = require('../fixDates');
module.exports = exports = function(self, cb) {
  async.waterfall([

    function(cb) {
      var composite = new self.Composite({
        name: 'stuff',
        telephone: '999-999-9999',
        createdBy: 'ross',
        someCompositeThing: {
          compositeMemberOne: 'one',
          compositeMemberTwo: 'two'
        },
      });
      composite.save(function(err, composite) {
        cb(err, {
          composite: composite
        });
      });
    },
    function(p, cb) {
      p.composite.someCompositeThing.compositeMemberOne = 'three';
      p.composite.someCompositeThing.compositeMemberTwo = 'five';
      p.composite.save(function(err, composite) {
        p.composite = composite;
        cb(err, p);
      });
    },
    function(p, cb) {
      p.composite.someCompositeThing.compositeMemberOne = 'four';
      p.composite.save(function(err, composite) {
        p.composite = composite;
        cb(err, p);
      });
    },
    function(p, cb) {
      fixDates(p.composite, function(err) {
        cb(err, p);
      });
    },
  ], function(err, p) {
    cb(err, p);
  });
};
