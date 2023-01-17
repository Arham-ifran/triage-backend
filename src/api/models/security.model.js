const mongoose = require('mongoose');

/**
 * Security Schema
 * @private
 */
const SecuritySchema = new mongoose.Schema({
    login: { type: Boolean, default: false },
    withdrawal: { type: Boolean, default: false },
    accountDeletion: { type: Boolean, default: false },
    changeEmail: { type: Boolean, default: false },
    changePassword: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }
);

/**
 * @typedef Security
 */

module.exports = mongoose.model('Security', SecuritySchema);