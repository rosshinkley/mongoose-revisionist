Creates Mongo's oplog-like records for Mongoose operations.

## Installation
Use `npm`: `npm install mongoose-revisionist`

## Operation
Each creation, update or removal will create a Revisionist record with appropriate versioning information.  This allows for easy tracking of changes to records through time as well as providing an auditing mechanism.

The Mongoose plugin adds a `revision` field of type `Number` to the target schema, which is autoincremented every save.  The plugin will also add a collection of revisions that are _close_ to (but not quite exactly) oplog records:

- *ts* - `Date` - the timestamp of the operation, defaults to `Date.now`.
- *v* - `Number` - the Mongoose-internal version of the document.
- *op* - `String` - the operation type.
- *o* - `Mixed` - depends on operation:
    - *create* - full account of what is inserted in `_$set`, ID inclusive.
    - *update* - full account of what is changed in `_$set` for changes and additions, `_$unset` for removals, ID exclusive.
    - *remove* - ID of the document only.
- *o2* - `Mixed` - depends on operation:
    - *create* - omitted as it is not needed
    - *update* - ID of the document being updated
    - *remove* - omitted as it is not needed
- *revision* - what revision of the document the change was for.
- *referenceId* - the ID of the document the change is for.

## Usage
Use as you would any Mongoose plugin:

    var mongoose = require('mongoose'),
        Revisionist = require('mongoose-revisionist'),
        schema = new mongoose.Schema({ ... });
        schema.plugin(Revisionist.plugin);

If more help is needed, have a look in tests/models.

### Options:
The Revisionist plugin also takes an options hash using the plugin syntax:

    schema.plugin(Revisionist.plugin, options);

- *modelName* - the model name of where revisions get saved.  Defaults to `Revisionist`.

### Instance Methods

#### .versions(cb)
Gets the valid versions for a given Mongoose document.  Calls back with an array of integers.

#### .getVersion([versionNumber|date|'current', ] cb)
Gets a specific version of a given Mongoose document.  The first argument of the call can be a version number, a date (to get by date), "current" to get the current version, or not specified, also to get the current version.  Calls back with the collapsed version as it would have appeared at that number/date.

#### .diff(versionNumber|date, versionNumber|date, cb)
Gets the difference in versions or between dates specified.  Calls back with an object with three hashes: `added`, `removed`, `updated`.  Each hash has member paths denoting they were changed, as well as what the value was changed from and to along with the version the change happened in.  For example:

```js
{ 
    added: {},
    updated: { 
        name: { 
            from: 'bar', 
            to: 'baz', 
            revision: 4 
        } 
    },
    removed: {}
}
```
... would denote that the `name` field was updated from `bar` to `baz` in the 4th revision.

### Static Methods
Each of the above instance methods are also available as static methods on the Mongoose model.  The only additional parameter required is a valid Mongo ID as the first parameter.  For example, `instance.diff()` would have the signature `Model.diff(id, versionNumber|date, versionNumber| date, cb)`.
