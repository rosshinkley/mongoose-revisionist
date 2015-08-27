var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId

var compositeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    someCompositeThing: {
        compositeMemberOne: {
            type: String,
            required: true
        },
        compositeMemberTwo: {
            type: String,
            required: false
        }
    }
}, {});

compositeSchema.plugin(require('../../../revisionist')
    .plugin);
module.exports = exports = compositeSchema;
