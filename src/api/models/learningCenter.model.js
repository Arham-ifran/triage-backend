const mongoose = require('mongoose');

/**
 * LearningCenter Schema
 * @private
 */
const LearningCenterSchema = new mongoose.Schema({
    image:{type:String},
    title: { type: String, required: true, default: '' },
    link: { type: String, default: ''},
    linkType: { type: Boolean},    //true = video  ,  false = image
    dashboard:{ type: Boolean},
    status: { type: Boolean, default: false},
}, { timestamps: true }
);

/**
 * @typedef LearningCenter
 */

module.exports = mongoose.model('LearningCenter', LearningCenterSchema);