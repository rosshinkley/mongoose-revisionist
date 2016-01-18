var _ = require('lodash'),
  util = require('util'),
  async = require('async'),
  argx = require('argx'),
  moment = require('moment'),
  mongoose = require('mongoose');

_.mixin({
  keysDeep: function(thing, leafsOnly) {
    var paths = [];
    var t = function(thing, path) {
      _.each(thing, function(value, key) {
        path.push(key);
        var isLeaf = true;
        if (!/^[a-fA-F0-9]{24}/.test(thing[key].toString()) && (_.isObject(thing[key]) || _.isArray(thing[key]))) {
          isLeaf = false;
          t(thing[key], path);
        }
        if (leafsOnly && isLeaf) {
          paths.push(path.join('.'));
        }

        if (!leafsOnly) {
          paths.push(path.join('.'));
        }
        path.pop();
      });
    };
    t(thing, []);
    return paths;
  }
});

var revisionist = {
  schema: new mongoose.Schema({
    ts: {
      type: Date,
      default: Date.now
    },
    v: Number,
    op: String,
    ns: String,
    o: mongoose.Schema.Types.Mixed,
    o2: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    revision: Number,
    referenceId: mongoose.Schema.Types.ObjectId
  }),
  plugin: function(schema, options) {
    options = _.defaultsDeep(options || {}, {
      modelName: 'Revisionist'
    });

    schema.add({
      modified: Date,
      modifiedBy: String,
      created: Date,
      createdBy: String,
      revision: Number
    });

    schema.method('versions', function(cb) {
      this.collection.conn.models[options.modelName].find({
        referenceId: this._id
      }, {
        revision: 1
      })
        .exec(function(err, revisions) {
          cb(err, _.uniq(revisions));
        });
    });

    var collapse = function() {
      var args = argx(arguments);

      var cb = args.pop('function') || function() {},
        referenceId = args.shift(),
        connection = args.shift(),
        values = args.remain();

      var version, date;
      if (values.length == 0) {
        version = 'current';
      } else if (values.length == 1) {
        if (moment.isMoment(values[0]) ||
          _.isDate(values[0])) {
          date = moment(values[0]);
        } else {
          version = values[0];
        }
      } else {
        throw 'Too many arguments specified for getVersion.';
      }

      var query = {
        referenceId: referenceId
      };
      if (!!version && version != 'current') {
        query.revision = {
          $lte: version
        };
      } else if (!!date) {
        query.ts = {
          $lte: date.toDate()
        };
      }

      connection.models[options.modelName].find(query)
        .exec(function(err, revisions) {
          var collapsed = revisions.length == 0 ? undefined : {};
          _.each(revisions, function(revision) {
            if (revision.op == 'i' || (revision.op == 'u' && revision.o.hasOwnProperty('_id'))) {
              _.each(revision.o['_$set'], function(value, key) {
                collapsed[key] = value;
              });
            } else if (revision.op == 'u') {
              if (revision.o.hasOwnProperty('_$set')) {
                _.each(revision.o['_$set'], function(value, key) {
                  collapsed[key] = value;
                });
              }
              if (revision.o.hasOwnProperty('_$unset')) {
                _.each(revision.o['_$unset'], function(value, key) {
                  delete collapsed[key];
                });
              }
            }
          })

          cb(err, collapsed);
        });
    };

    var diff = function() {
      var args = argx(arguments);

      var cb = args.pop('function') || function() {},
        referenceId = args.shift(),
        connection = args.shift(),
        values = args.remain();

      var startDate, endDate, startVersion, endVersion;
      if (values.length == 2) {
        if ((moment.isMoment(values[0]) || _.isDate(values[0])) &&
          (moment.isMoment(values[1]) || _.isDate(values[1]))) {
          startDate = moment(values[1]);
          endDate = moment(values[0]);
        } else {
          startVersion = values[0];
          endVersion = values[1];
        }
      } else {
        throw 'invalid arguments specified for diff.';
      }

      var query = {
        referenceId: referenceId
      };
      if (startDate && endDate) {
        query.ts = {
          $lte: endDate.toDate(),
          $gte: startDate.toDate()
        };
      } else if (startVersion && endVersion) {
        query.revision = {
          $lte: endVersion,
          $gte: startVersion
        };
      }

      connection.models[options.modelName].find(query)
        .exec(function(err, revisions) {
          var collapsed = revisions.length == 0 ? undefined : {
            added: {},
            updated: {},
            removed: {}
          };
          _.each(revisions, function(revision) {
            if (revision.op == 'i' || (revision.op == 'u' && revision.o.hasOwnProperty('_id'))) {
              _.each(_.keysDeep(revision.o['_$set'], true), function(key) {
                var value = _.get(revision.o['_$set'], key),
                  from = (collapsed.added[key] || {})
                  .to;
                if (collapsed.updated[key]) {
                  from = collapsed.updated[key].to;
                  delete collapsed.updated[key];
                }
                if (collapsed.removed[key]) {
                  from = collapsed.removed[key].to;
                  delete collapsed.removed[key];
                }
                collapsed.added[key] = {
                  from: from,
                  to: (/^[a-fA-F0-9]{24}/.test(value.toString()) ? value.toString() : value),
                  revision: revision.revision
                }

              });

            } else if (revision.op == 'u') {
              if (revision.o.hasOwnProperty('_$set')) {
                _.each(_.keysDeep(revision.o['_$set'], true), function(key) {
                  var value = _.get(revision.o['_$set'], key),
                    from = (collapsed.updated[key] || {})
                    .to;
                  if (collapsed.added[key]) {
                    from = collapsed.added[key].to;
                    delete collapsed.added[key];
                  }
                  if (collapsed.removed[key]) {
                    from = collapsed.removed[key].to;
                    delete collapsed.removed[key];
                  }
                  collapsed.updated[key] = {
                    from: from,
                    to: (/^[a-fA-F0-9]{24}/.test(value.toString()) ? value.toString() : value),
                    revision: revision.revision
                  }

                });
              }
              if (revision.o.hasOwnProperty('_$unset')) {
                _.each(_.keysDeep(revision.o['_$unset'], true), function(key) {
                  var value = _.get(revision.o['_$unset'], key),
                    from = (collapsed.removed[key] || {})
                    .to;
                  if (collapsed.added[key]) {
                    from = collapsed.added[key].to;
                    delete collapsed.added[key];
                  }
                  if (collapsed.updated[key]) {
                    from = collapsed.updated[key].to;
                    delete collapsed.updated[key];
                  }
                  collapsed.removed[key] = {
                    from: from,
                    to: (/^[a-fA-F0-9]{24}/.test(value.toString()) ? value.toString() : value),
                    revision: revision.revision
                  }

                });

              }
            }
          })

          cb(err, collapsed);
        });
    };

    schema.method('getVersion', function() {
      var args = [].slice.call(arguments);
      args.unshift(this.collection.conn),
      args.unshift(this._id);
      collapse.apply(null, args);
    });

    schema.static('getVersion', function() {
      var args = [].slice.call(arguments);
      args.splice(1, 0, this.db);
      collapse.apply(null, args);
    });

    schema.method('diff', function() {
      var args = [].slice.call(arguments);
      args.unshift(this.collection.conn),
      args.unshift(this._id);
      diff.apply(null, args);
    });

    schema.static('diff', function() {
      var args = [].slice.call(arguments);
      args.splice(1, 0, this.db);
      diff.apply(null, args);
    });

    schema.pre('save', function(next) {
      var self = this,
        connection = this.collection.conn;


      if (!!options.connectionString) {
        connection = mongoose.createConnection(options.connectionString);
      }

      //add the revisionist schema
      var revisionistModel = connection.model(options.modelName, revisionist.schema);

      //get the original and update object
      var original = self._original,
        update = self.toObject(),
        operation = 'u';

      //determine what kind of operation this is
      if (!original) {
        operation = 'i';
        self.created = moment()
          .toDate();

        //check createdBy
        if (!self.createdBy && !self.modifiedBy) {
          console.warn('mongoose-revisionist: no createdBy specified for %s in model %s', self._id, self.constructor.modelName);
          self.createdBy = '[unknown]';
        } else if (!self.createdBy) {
          self.createdBy = self.modifiedBy;
        }
      }

      //set the modified date
      self.modified = moment()
        .toDate();

      //check modifiedBy
      if (!self.modifiedBy && operation == 'i') {
        self.modifiedBy = self.createdBy;
      } else if (!self.modifiedBy) {
        console.warn('mongoose-revisionist: no modifiedBy specified for %s in model %s', self._id, self.constructor.modelName);
        self.modifiedBy = '[unknown]';
      }

      //first, determine what overlaps, and what is different in that set
      var set = _.chain(original)
        .keysDeep()
        .intersection(_.keysDeep(update))
        .map(function(key) {
          var temp = self.schema.path(key);
          return {
            key: key,
            type: (self.schema.path(key) || {})
              .instance
          };
        })
        .filter(function(key) {
          return !!key.type
        })
        .map(function(key) {
          return key.key;
        })
        .map(function(key) {
          var getValue = function(value, instance) {
              if (_.isDate(value)) {
                //if the member is a date, compare the integer representation
                //hack: consider using getTime() instead of +
                originalValue = +originalValue;
                newValue = +newValue
              } else if (_.isObject(value) && /^[0-9a-fA-F]{24}$/.test(value.toString())) {
                //if the member is a schema ID, compare the strings
                //hack: using isObject and a hex regex also feels bad.
                value = value.toString();
              } else if (_.isObject(value) && instance == 'ObjectID') {
                //if the member is a schema ID but is loaded - failing the schema ID check above,
                //check the IDs
                value = value._id.toString();
              } else if (_.isArray(value)) {
                //dope array for array checking
              } else if (_.isObject(value)) {
                //leave object alone, use _.isEqual to check
                //todo: nested objects?
              } else {
                //otherwise, the member is an ordinary primitive, compare those
              }

              return value;
            },
            //get the original compare value
            originalValue = getValue(_.get(original, key), self.schema.path(key)
              .instance),
            //get the new compare value
            newValue = getValue(_.get(update, key), self.schema.path(key)
              .instance);

          if (!_.isEqual(newValue, originalValue)) {
            //if the values don't match, return the key with the unmodified update value
            return {
              key: key,
              value: _.get(update, key)
            };
          }
        })
        .compact()
        .reduce(function(result, member, ix) {
          if (self.schema.path(member.key)
            .instance == 'ObjectID' && !/^[0-9a-fA-F]{24}$/.test(member.value.toString())) {
            _.set(result, member.key, member.value._id);
          } else {
            _.set(result, member.key, member.value);
          }
          return result;
        }, {})
        .value();

      //merge in the new values
      set = _.merge(set, _.chain(update)
        .keysDeep()
        .difference(_.keysDeep(original))
        .map(function(key) {
          var temp = self.schema.path(key);
          return {
            key: key,
            type: (self.schema.path(key) || {})
              .instance
          };
        })
        .filter(function(key) {
          return !!key.type
        })
        .map(function(key) {
          return key.key;
        })
        .map(function(key) {
          return {
            key: key,
            value: _.get(update, key)
          };
        })
        .reduce(function(result, member, ix) {
          if (self.schema.path(member.key)
            .instance == 'ObjectID' && !/^[0-9a-fA-F]{24}$/.test(member.value.toString())) {
            _.set(result, member.key, member.value._id);
          } else {
            _.set(result, member.key, member.value);
          }
          return result;
        }, {})
        .value());

      //make the unset
      var unset = _.chain(original)
        .keysDeep()
        .difference(_.keysDeep(update))
        .map(function(key) {
          var temp = self.schema.path(key);
          return {
            key: key,
            type: (self.schema.path(key) || {})
              .instance
          };
        })
        .filter(function(key) {
          return !!key.type
        })
        .map(function(key) {
          return key.key;
        })
        .reduce(function(result, key, ix) {
          _.set(result, key, 1);
          return result;
        }, {})
        .value();


      var o2 = null;
      if (operation == 'u') {
        o2 = {
          _id: original._id
        };
        delete set._id;
      }
      //create the revisionist record
      (new revisionistModel({
        ts: new Date(),
        op: operation,
        v: (original || {})
          .__v,
        ns: self.collection.collectionName,
        o: {
          '_$set': set,
          '_$unset': unset
        },
        o2: o2,
        revision: ++(original || {
          revision: 0
        })
          .revision,
        referenceId: self._id
      }))
        .save(function(err, revision) {
          self.revision = revision.revision;
          next();
        });

    });

    schema.pre('remove', function(next) {
      var self = this,
        connection = this.collection.conn;

      self.save(function(err) {

        if (!!options.connectionString) {
          connection = mongoose.createConnection(options.connectionString);
        }

        //add the revisionist schema
        var revisionistModel = connection.model(options.modelName, revisionist.schema);

        //create the revisionist record
        (new revisionistModel({
          ts: new Date(),
          op: 'd',
          v: (self._original || {})
            .__v,
          ns: self.collection.collectionName,
          o: {
            _id: self._id
          },
          revision: ++(self._original || {
            revision: 0
          })
            .revision,
          referenceId: self._id
        }))
          .save(function(err, revision) {
            self.revision = revision.revision;
            next();
          });
      });

    });

    schema.post('save', function() {
      this._original = this.toObject();
    });

    schema.post('init', function() {
      //when the db value is pulled, make a copy-on-write copy of the original values for audit purposes later
      this._original = this.toObject();
      //todo: add a dirty flag
    });

  },
};

module.exports = exports = revisionist;
