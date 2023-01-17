const mongoose = require('mongoose');

/**
 * TokensWallet Schema
 * @private
 */

const TokensWalletSchema = new mongoose.Schema({ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ethereum: { type: String, },
    ethereumPrivateKey: { type: String, },
    ethereumQR: { type: String, },
    
    binance: { type: String, },
    binancePrivateKey: { type: String, },
    binanceQR: { type: String, },
    
    btc: { type: String, },
    btcPrivateKey: { type: String, },
    stellar: { type: String, },
    stellarPrivateKey: { type: String, },
    ripple: { type: String, },
    ripplePrivateKey: { type: String, },
}, { timestamps: true }
);

/**
 * @typedef TokensWallet
 */

module.exports = mongoose.model('TokensWallet', TokensWalletSchema);