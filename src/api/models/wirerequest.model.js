const mongoose = require('mongoose');

/**
 * WireRequest Schema
 * @private
 */
const WireRequestSchema = new mongoose.Schema({
    historyId: { type: mongoose.Schema.Types.ObjectId, ref: 'History' },
    promoCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' },
    referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    referrerPercent: { type: Number },
    localImage: { type: String },
    status: {type: Number, default: 1}, // 1= Not Processed, 2= Processed and Approved, 3 = Processed and Rejected 
}, { timestamps: true }
);

/**
 * @typedef WireRequest
 */

module.exports = mongoose.model('WireRequest', WireRequestSchema);