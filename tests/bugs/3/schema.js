var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    util = require('util'),
    ObjectId = Schema.Types.ObjectId

var schema = new mongoose.Schema({
    hashtag: {
        type:String,
        required: true,
        index: {unique: true},
        es_indexed: true,
        es_index:"analyzed",
        es_index_analyzer:"autocomplete_analyzer"
    },
    title: {
        type: String,
        required: true,
        es_indexed: true,
        es_index:"analyzed",
        es_index_analyzer:"autocomplete_analyzer"
    },
    description: {
        type: String,
        es_indexed: true,
        es_index:"analyzed",
        es_index_analyzer:"ac_search_analyzer"
    },
    center: {
        type: String,
        required: true,
        es_indexed: true,
        es_index:"analyzed",
        es_index_analyzer:"autocomplete_analyzer"
    },
    created_by: {
        id: {
            type:String,
            required: true,
            es_indexed: true,
            es_index:"analyzed",
            es_index_analyzer:"autocomplete_analyzer"
        },
        name: {
            type:String,
            required: true,
            es_indexed: true,
            es_index:"analyzed",
            es_index_analyzer:"autocomplete_analyzer"
        }
    },
    type: {
        type: String,
        required: true,
        enum: ['test']
    },
    value: { type: String },
    placeholder1: { type: String },
    placeholder2: { type: String },
    placeholder3:[{
        id: {
            type:String,
            es_indexed: true,
            es_index:"analyzed",
            es_index_analyzer:"autocomplete_analyzer"
        },
        name: {
            type:String,
            es_indexed: true,
            es_index:"analyzed",
            es_index_analyzer:"autocomplete_analyzer"
        },
        domain: { type:String },
        type : {
            type: String,
            //enum: bit_type_options
        },
        value: {
            type: String,
            //enum: bit_options
        },
        lastModified: {
            type: Date,
            default: Date.now()
        }
    }],
    watchers:[{
        id: {
            type:String,
            es_indexed: true,
            es_index:"analyzed",
            es_index_analyzer:"autocomplete_analyzer"
        },
        name: {
            type:String,
            es_indexed: true,
            es_index:"analyzed",
            es_index_analyzer:"autocomplete_analyzer"
        }
    }],
    resources: [{
        title: {type: String},
        link: {type: String}
    }],
    tags: [{
        type: String,
        es_indexed: true,
        es_index:"analyzed",
        es_index_analyzer:"autocomplete_analyzer"
    }],
    comments:[{
        commenter_id: {
            type:String,
            es_indexed: true,
            es_index:"analyzed",
            es_index_analyzer:"autocomplete_analyzer"
        },
        commenter_name: {
            type:String,
            es_indexed: true,
            es_index:"analyzed",
            es_index_analyzer:"autocomplete_analyzer"
        },
        commented_at: {type: Date, default: Date.now()},
        message: {type: String}
    }],
    date: { type: Date, default: Date.now() },
    created_at: { type: Date, default: Date.now() },
    updated_at: { type: Date, default: Date.now() }
});

schema.plugin(require('../../../revisionist')
    .plugin);

module.exports = exports = schema;
