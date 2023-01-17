const mongoose = require('mongoose');

/**
 * Sdk Schema
 * @private
 */
const SdkSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    link: {type: String, default: '' },
    version: {type: String, default: '' },
    latest: {type: Boolean, default: false },
}, { timestamps: true }
);

/**
 * @typedef Sdk
 */

module.exports = mongoose.model('Sdk', SdkSchema);