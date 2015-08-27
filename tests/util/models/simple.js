var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    util = require('util'),
    ObjectId = Schema.Types.ObjectId

var simpleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: false
    },
}, {});

simpleSchema.plugin(require('../../../revisionist')
    .plugin);

module.exports = exports = simpleSchema;
