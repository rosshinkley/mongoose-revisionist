Creates Mongo's oplog-like records for Mongoose operations.

## Installation
Use `npm`: `npm install mongoose-revisionist`

## Operation
Each creation, update or removal will create a Revisionist record with appropriate versioning information.  This allows for easy tracking of changes to records through time as well as providing an auditing mechanism.

The Mongoose plugin adds a handful of fields to the schema if they do not exist already:

- *modified* - `Date` - when the document was last modified.
- *modifiedBy* - `String` - who/what last modified the document.
- *created* - `Date` - when the document was created.
- *createdBy* - `String` - who/what created the document.
- *revision* - `Number` - the revision of the document, autoincremented every save.

The plugin will also add a collection of revisions that are _close_ to (but not quite exactly) oplog records:

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

- *versions* - gets the valid versions for a given Mongoose document.  Calls back with an array of integers.
- *getVersion* - gets a specific version of a given Mongoose document.  The first argument of the call can be a version number, a date (to get by date), "current" to get the current version, or not specified, also to get the current version.

### Static Methods

- *getVersion* - gets a specific version of a given Mongoose document.  The first argument must be the document ID to retrieve.  The rest is exactly the same as the intance method: The second argument of the call can be a version number, a date (to get by date), "current" to get the current version, or not specified, also to get the current version.


