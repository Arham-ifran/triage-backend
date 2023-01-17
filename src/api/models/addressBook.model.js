const mongoose = require('mongoose');

/**
 * AddressBook Schema
 * @private
 */

const AddressBookSchema = new mongoose.Schema({ 
    type: { type: String, default: "crypto" }, //crypto/ bank 
    label: { type: String },
    beneficiaryName: { type: String },
    beneficiaryAddress: { type: String },
    country: { type: String },
    bankName: { type: String },
    bankAddress: { type: String },
    bankAccount: { type: String },
    bic_swift: { type: String },
    comment: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, { timestamps: true }
);

/**
 * @typedef AddressBook
 */

module.exports = mongoose.model('AddressBook', AddressBookSchema);