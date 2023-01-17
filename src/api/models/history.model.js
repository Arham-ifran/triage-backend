const mongoose = require('mongoose');

/**
 * History Schema
 * @private
 */
const HistorySchema = new mongoose.Schema({

    senderAddress: { type: String, }, // wallet address 
    receiverAddress: { type: String, }, // wallet address

    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    historyType: { type: Number, required: true }, // 1 = Deposit, 2= Withdrawals, 3= Exchange, 4 = Referrals, 5 = Bonuses, 6 = Savings Operation
    amountSent: { type: Number },
    currency: { type: String },
    gasFee: { type: Number },
    txHash: { type: String },

    // Deposit 
    depositAmountSent: { type: Number },
    depositType: {type: Number}, // 1 = Wire Transfer, 2 = paypal,
    receiptUploaded: {type: Boolean, default: false}, // 
    depositAmountCredited: { type: Number },
    promoCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' },
    referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referrerPercent: {type: Number},

    // Withdrawals
    // WithdrawAmountSent: { type: Number },
    // walletAddress: { type: String },
    // txHash: { type: String },
    // uuid: { type: String },
    // fees: { type: Number },
    // amountAfterFees: { type: Number },
    // status: { type: String },

    // Exchange
    // exchangeAmountSent: { type: Number },
    // exchangeAmountCredited: { type: Number },

    // Referrals 
    referralCurrency: { type: String },
    email: { type: String },
    // referralamountSent: { type: Number },

    // Bonuses 
    bonusType: { type: Number },  // ( 1 = tokens, 2 = profit)
    bonusAmountCredited: { type: Number },

    // Savings Operation
    lockedCurrency: { type: Number },
    savingsCurrency: { type: mongoose.Schema.Types.ObjectId, ref: 'criteria' },

    // savingAmountCredited: { type: Number },
    profitType: { type: Number }

}, { timestamps: true }
);

/**
 * @typedef History
 */

module.exports = mongoose.model('History', HistorySchema);