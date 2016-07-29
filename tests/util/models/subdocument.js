var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    util = require('util'),
    ObjectId = Schema.Types.ObjectId;

var embeddedSchema = new Schema({
    name: {
        type: String,
        required:true
    }
});

var parentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    someNumber: {
        type: Number,
        required:true,
        default:0
    },
    embedded: [embeddedSchema]
}, {});

parentSchema.plugin(require('../../../revisionist')
    .plugin);

module.exports = exports = parentSchema;
