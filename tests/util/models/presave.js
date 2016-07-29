var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    util = require('util'),
    ObjectId = Schema.Types.ObjectId

var presaveSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: false
    },
    someNumber: {
        type: Number,
        required:true,
        default:0
    }
}, {});



presaveSchema.pre('save', function(next) {
    this.someNumber = (this.someNumber || 0) + 1;
    next();
});

presaveSchema.plugin(require('../../../revisionist')
    .plugin);

module.exports = exports = presaveSchema;
