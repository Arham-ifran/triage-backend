const mongoose = require('mongoose');

/**
 * UsedPromoCode Schema
 * @private
 */
const UsedPromoCodeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    promoCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' },
    noOfTimesUsed: { type: Number, default: 0 },
}, { timestamps: true }
);

/**
 * @typedef UsedPromoCode
 */

module.exports = mongoose.model('usedpromocode', UsedPromoCodeSchema);