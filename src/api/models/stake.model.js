const mongoose = require('mongoose');

/**
 * Stake Schema
 * @private
 */
const StakeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    criteriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Criteria', required: true },
    depositedAmount: { type: Number, required: true },
    monthlyInterest: { type: Number, required: true },
    yearlyInterest: { type: Number, required: true },
    totalInterest: { type: Number, required: true },
    totalToBeReceived: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    dailyProfit: {type: Number},
    stakeStartDate: { type: Date, required: true },
    stakeEndDate: { type: Date, required: true },
    interestPaid: { type: Boolean, required: true, default: false }, //true when interest paid
    profitType: { type: Number, required: true }, //1- availableProfit, 2- lockedProfit
    profitAmount: { type: Number, default: 0 },
    profitAmountPaid: { type: Number, default: 0 },
    availableProfit: {type: Number},
    lockedProfit: {type:Number},
    promoCode: { type: String },
    currency: { type: String },
    months: { type: String },
    transferToAdmin: { type: Boolean }
}, { timestamps: true }
);

/**
 * @typedef Stake
 */

module.exports = mongoose.model('Stake', StakeSchema);