const mongoose = require('mongoose');

/**
 * News Schema
 * @private
 */
const NewsSchema = new mongoose.Schema({
    thumbnail:{type:String},
    title: { type: String, required: true, default: '' },
    description: { type: String, default: ''},
    type:{type:String},
    status: { type: Boolean, default: false},
}, { timestamps: true }
);

/**
 * @typedef NEWS
 */

module.exports = mongoose.model('News', NewsSchema);