const mongoose = require('mongoose');

/**
 * AccountTier Schema
 * @private
 */
const AccountTierSchema = new mongoose.Schema({
    level: { type: Number, required: true, unique: true }, //  1 = Bronze, 2 = Silver, 3 = Gold, 4 = Platinum
    image: { type: String },
    imageLocal: { type: String },
    maxSubLevel: { type: Number, required: true, default: 3 }
}, { timestamps: true }
);

/**
 * @typedef AccountTier
 */

module.exports = mongoose.model('account-tiers', AccountTierSchema);