var mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema(
    {
        walletAddress: { type: String, required: true, },
        type: { type: Number, required: true, }, // [1- primary, 2- native, 3- non-native]  
        name: { type: String, required: true, },
        logo: { type: String },
        symbol: { type: String, unique: true, required: true },
        networkId: { type: Number, requried: true },
        // status (i.e: true for active & false for in-active)
        status: { type: Boolean, default: false },
        interestRate: { type: Number, required: true, default: 0}
    },
    {
        timestamps: true
    }
);

WalletSchema.index({ identityNumber: 'walletAddress' });
module.exports = mongoose.model("Wallet", WalletSchema);
