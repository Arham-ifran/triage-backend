const mongoose = require('mongoose');

/**
 * BankDetails Schema
 * @private
 */
const BankDetailsSchema = new mongoose.Schema({
    referenceId: { type: String, default: '' },
    beneficiaryName: { type: String, default: '' },
    beneficiaryAddress: { type: String, default: '' },
    beneficiaryBankName: { type: String, default: '' },
    beneficiaryBankAddress: { type: String, default: '' },
    Iban: { type: String, default: '' },
    bic: { type: String, default: '' },
    condition: { type: String, default: '' },
    attention: { type: String, default: '' },
   
}, { timestamps: true }
);

/**
 * @typedef BankDetails
 */

module.exports = mongoose.model('BankDetail', BankDetailsSchema);