var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var compositeWithArraySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    compositeArray: [{
        arrayMemberOne: {
            type: String,
            required: true
        },
        arrayMemberTwo:{
            type:String,
            required:false
        }
    }]
}, {});

compositeWithArraySchema.plugin(require('../../../revisionist')
    .plugin);

module.exports = exports = compositeWithArraySchema;
