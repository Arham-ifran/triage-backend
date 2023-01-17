const mongoose = require('mongoose');

/**
 * Criteria Schema
 * @private
 */
const CriteriaSchema = new mongoose.Schema({
    accountTierId: { type: mongoose.Schema.Types.ObjectId, ref: 'account-tiers', required: true },
    subLevel: { type: Number, required: true },
    minInvestment: { type: Number, required: true },
    maxInvestment: { type: Number, required: true },
    profitInMonths: { type: Array }
}, { timestamps: true }
);

/**
 * @typedef Criteria
 */

module.exports = mongoose.model('criteria', CriteriaSchema);