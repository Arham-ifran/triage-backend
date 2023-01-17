const mongoose = require('mongoose');

/**
 * Teammate Schema
 * @private
 */
const TeammateSchema = new mongoose.Schema({
    teammateId: { type: String, default: '' },
    userId: {type: String, default: '' },
    roles: {type: [String] },
    gameAccess:{type:[String]},
    futureAccess:{type:Boolean,default:false},
    status:{type:Boolean,false:true}
}, { timestamps: true }
);

/**
 * @typedef Teammate
 */

module.exports = mongoose.model('Teammate', TeammateSchema);