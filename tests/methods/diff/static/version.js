var mongoose = require('mongoose'),
  util = require('util'),
  async = require('async'),
  _ = require('lodash'),
  logger = require('winston'),
  should = require('should'),
  testUtil = require('../../../util');

describe('get diffs by version numbers', function() {
  it('gets a diff of a simple model', function(done) {
    var self = this;
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
        self.Simple.diff(p.simple.id, 3, 4, function(err, diff) {
          p.updateDiff = diff;
          cb(err, p);
        });
      },
    ], function(err, p) {
      if (err) return done(err);
      should(p.simple)
        .be.ok();
      p.updateDiff.updated.name.from.should.equal('bar');
      p.updateDiff.updated.name.to.should.equal('baz');
      p.updateDiff.updated.name.revision.should.equal(4);
      done();
    });
  });
  it('gets a diff of a composite model', function(done) {
    var self = this;
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
        self.Composite.diff(p.composite.id, 2, 3, function(err, diff) {
          p.updateDiff = diff;
          cb(err, p);
        })
      }
    ], function(err, p) {
      if (err) return done(err);
      should(p.updateDiff)
        .be.ok();
      p.updateDiff.updated['someCompositeThing.compositeMemberOne'].from.should.equal('three');
      p.updateDiff.updated['someCompositeThing.compositeMemberOne'].to.should.equal('four');
      p.updateDiff.updated['someCompositeThing.compositeMemberOne'].revision.should.equal(3);
      done();
    });

  });

  it('gets a diff of a composite model with an array', function(done) {
    var self = this;
    async.waterfall([

      function(cb) {
        var composite = new self.CompositeWithArray({
          name: 'stuff',
          telephone: '999-999-9999',
          createdBy: 'ross',
          compositeArray: [{
            arrayMemberOne: 'one',
            arrayMemberTwo: 'two'
          }],
        });

        composite.save(function(err, composite) {
          cb(err, {
            composite: composite
          });
        });
      },
      function(p, cb) {
        p.composite.compositeArray[0].arrayMemberOne = 'three';
        p.composite.save(function(err, composite) {
          p.composite = composite;
          cb(err, p);
        });
      },
      function(p, cb) {
        p.composite.compositeArray[0].arrayMemberOne = 'four';
        p.composite.save(function(err, composite) {
          p.composite = composite;
          cb(err, p);
        });
      },
      function(p, cb) {
        self.CompositeWithArray.diff(p.composite.id, 2, 3, function(err, diff) {
          p.updateDiff = diff;
          cb(err, p);
        });
      }
    ], function(err, p) {
      if (err) return done(err);
      p.updateDiff.updated['compositeArray.0.arrayMemberOne'].from.should.equal('three');
      p.updateDiff.updated['compositeArray.0.arrayMemberOne'].to.should.equal('four');
      p.updateDiff.updated['compositeArray.0.arrayMemberOne'].revision.should.equal(3);
      done();
    });

  });

  it('gets a diff of a model with a reference', function(done) {
    var self = this;
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
        self.Reference.diff(p.reference.id, 2, 3, function(err, diff) {
          p.updateDiff = diff;
          cb(err, p);
        });
      }
    ], function(err, p) {
      if (err) return done(err);
      p.updateDiff.updated['simple'].from.should.equal(p.simple2.id.toString());
      p.updateDiff.updated['simple'].to.should.equal(p.simple3.id.toString());
      p.updateDiff.updated['simple'].revision.should.equal(3);

      done();
    });
  });

  it('should handle a bad future version', function(done) {
        var self = this;
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
                self.Simple.diff(p.simple.id, 9, 10, function(err, diff) {
                    p.updateDiff = diff;
                    cb(err, p);
                });
            },
        ], function(err, p) {
            if (err) return done(err);
            should(p.updateDiff).not.be.ok();
            done();
        });
    });
    it('should handle a bad past version', function(done) {
        var self = this;
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
                self.Simple.diff(p.simple.id, -9, -8, function(err, diff) {
                    p.updateDiff = diff;
                    cb(err, p);
                });
            },
        ], function(err, p) {
            if (err) return done(err);
            should(p.updateDiff).not.be.ok();
            done();
        });
    });
});
