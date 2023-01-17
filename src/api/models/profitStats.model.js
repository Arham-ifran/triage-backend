const mongoose = require('mongoose');

/**
 * ProfitStats Schema
 * @private
 */
const profitStatsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    depositedAmount: { type: Number },
    totalToBeReceived: { type: Number },
    dailyProfit: {type: Number},
    stakeStartDate: { type: Date },
    stakeEndDate: { type: Date },
    profitType: { type: Number }, //1- availableProfit, 2- lockedProfit
    availableProfit: {type: Number},
    lockedProfit: {type:Number},
}, { timestamps: true }
);

/**
 * @typedef ProfitStats
 */

module.exports = mongoose.model('ProfitStats', profitStatsSchema);