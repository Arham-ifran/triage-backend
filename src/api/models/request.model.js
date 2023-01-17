const mongoose = require('mongoose');

/**
 * Request Schema
 * @private
 */

const RequestSchema = new mongoose.Schema({ 
    type: { type: Number, default: 1 },  // 1-accountDeletion  
    description: { type: String, },
    status: { type: String, default: 1}, // 1-pending, 2-accepted, 3-rejected
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, { timestamps: true }
);

/**
 * @typedef Request
 */

module.exports = mongoose.model('Request', RequestSchema);