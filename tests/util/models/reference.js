var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    simpleModel = require('./simple'),
    compositeModel = require('./composite'),
    compositeModelWithArray = require('./compositeWithArray');
var referenceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    simple: {
        type: ObjectId,
        ref: 'Simple'
    },
    composite: {
        type: ObjectId,
        ref: 'Composite'
    },
    compositeArray: {
        type: ObjectId,
        ref: 'CompositeWithArray'
    }
}, {});

referenceSchema.plugin(require('../../../revisionist')
    .plugin);
module.exports = exports = referenceSchema;
