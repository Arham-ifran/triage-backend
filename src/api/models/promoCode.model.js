const mongoose = require('mongoose');

/**
 * PromoCode Schema
 * @private
 */
const PromoCodeSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    NoOfTimesCodeAvailable: { type: Number },
    codeType: { type: Number }, // ( 1 = tokens, 2 = profit)
    bonus: { type: Number },
    status: { type: Boolean, default: false },
    description: { type: String, required: true, default: '' },
}, { timestamps: true }
);

/**
 * @typedef PromoCode
 */

module.exports = mongoose.model('promocode', PromoCodeSchema);