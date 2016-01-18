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
      var composite = new self.Composite({
        name: 'stuff',
        telephone: '999-999-9999',
        someCompositeThing: {
          compositeMemberOne: 'one',
          compositeMemberTwo: 'two'
        },
        createdBy: 'ross'
      });

      composite.save(function(err, composite) {
        p.composite = composite;
        cb(err, p);
      });
    },
    function(p, cb) {
      var compositeWithArray = new self.CompositeWithArray({
        name: 'stuff',
        telephone: '999-999-9999',
        compositeArray: [{
          arrayMemberOne: 'one',
          arrayMemberTwo: 'two'
        }],
        createdBy: 'ross'
      });

      compositeWithArray.save(function(err, compositeWithArray) {
        p.compositeWithArray = compositeWithArray;
        cb(err, p);
      });
    },
    function(p, cb) {
      var reference = new self.Reference({
        name: 'stuff',
        telephone: '999-999-9999',
        simple: p.simple,
        composite: p.composite,
        compositeArray: p.compositeWithArray,
        createdBy: 'test'
      });

      reference.save(function(err, reference) {
        p.reference = reference;
        cb(err, p);
      });
    },
    function(p, cb) {
      var simple = new self.Simple({
        name: 'stuff',
        telephone: '999-999-9999',
        createdBy: 'ross'
      });

      simple.save(function(err, simple) {
        p.simple2 = simple;
        cb(err, p);
      });
    },
    function(p, cb) {
      p.reference.simple = p.simple2;
      p.reference.save(function(err, reference) {
        p.reference = reference;
        cb(err, p);
      });
    },
    function(p, cb) {
      var simple = new self.Simple({
        name: 'stuff',
        telephone: '999-999-9999',
        createdBy: 'ross'
      });

      simple.save(function(err, simple) {
        p.simple3 = simple;
        cb(err, p);
      });
    },
    function(p, cb) {
      p.reference.simple = p.simple3;
      p.reference.save(function(err, reference) {
        p.reference = reference;
        cb(err, p);
      });
    },
    function(p, cb) {
      fixDates(p.reference, function(err) {
        cb(err, p);
      });
    },

  ], function(err, p) {
    cb(err, p);
  });
};
