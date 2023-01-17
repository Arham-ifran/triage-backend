const mongoose = require('mongoose');

/**
 * Payment Schema
 * @private
 */

const PaymentSchema = new mongoose.Schema({ 
    paymentId: { type: String, required: true },
    payerId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    amountPaid: { type: String, required: true },
    tokenAddress: { type: String, required: true },
    txHash: { type: String, required: true }, 
    walletAddress: { type: String, required: true },
    transfered: { type: String, default: false }
}, { timestamps: true }
);

/**
 * @typedef Payment
 */

module.exports = mongoose.model('Payment', PaymentSchema);