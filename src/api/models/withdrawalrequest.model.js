const mongoose = require('mongoose');

/**
 * WithdrawalRequest Schema
 * @private
 */
const WithdrawalRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    withdrawalAmount: {type: Number},
    image: { type: String },
    localImage: { type: String },
    withdrwalMethod: {type: Number}, // 1= Wallet Balance, 2= Profit Balance
    amountDeducted: {type: Boolean, default: false},
    status: {type: Number, default: 1}, // 1= Not Processed, 2= Processed and Approved, 3 = Processed and Rejected    // ADMIN will set this
    userStatus: {type: Number, default: 0},  // 1 = Received, 2 = Not Received // USER will set this
}, { timestamps: true }
);

/**
 * @typedef WithdrawalRequest
 */

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);