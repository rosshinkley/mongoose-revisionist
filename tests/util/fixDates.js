var moment = require('moment'),
  async = require('async'),
  _ = require('lodash');
module.exports = exports = function(item, cb) {
  item.collection.conn.models['Revisionist'].find({
    referenceId: item._id
  })
    .sort({
      ts: -1
    })
    .exec(function(err, revisions) {
      async.parallel(_.map(revisions, function(revision, ix) {
        return function(cb) {
          revision.ts = moment(revision.ts)
            .subtract(ix, 'days').toDate();
          revision.save(function(err) {
            cb(err);
          });
        };
      }), function(err, r) {
        cb(err);
      });
    });
};
