const mongoose = require('mongoose');

/**
 * KYC Schema
 * @private
 */
const KYCSchema = new mongoose.Schema({
    personalDocumentPassportFront: { type: String },
    personalDocumentPassportFrontLocal: { type: String },
    personalDocumentPassportBack: { type: String },
    personalDocumentPassportBackLocal: { type: String },

    personalDocumentIDCardFront: { type: String },
    personalDocumentIDCardFrontLocal: { type: String },
    personalDocumentIDCardBack: { type: String },
    personalDocumentIDCardBackLocal: { type: String },

    personalDocumentDrivingIDFront: { type: String },
    personalDocumentDrivingIDFrontLocal: { type: String },
    personalDocumentDrivingIDBack: { type: String },
    personalDocumentDrivingIDBackLocal: { type: String },

    firstName: { type: String },
    lastName: { type: String },
    dob: { type: Date },

    phone: { type: String },
    country: { type: String },
    countryCode: { type: String },

    countryDocument: { type: String },
    countryDocumentLocal: { type: String },
    addressDocument: { type: String },
    addressDocumentLocal: { type: String },
    additionalDocument: { type: String },
    additionalDocumentLocal: { type: String },
    personalDocumentType: { type: Number }, // 1 = Passport, 2 = ID Card, 3 = Driving ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    kycStatus: { type: Boolean, default: false },
    appliedKYC: {type: Number } // 1 = draft, 2 = Requested, 3 = Approved
}, { timestamps: true }
);

/**
 * @typedef KYC
 */

module.exports = mongoose.model('KYC', KYCSchema);