const mongoose = require('mongoose');

/**
 * Token Schema
 * @private
 */
const TokenSchema = new mongoose.Schema({
    email: { type: String, default: '' },
    invitedBy:{type:String,default:''},
    // invitedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default:'' },
    status:{type:Boolean,default:false},
    token: {type: String, default: '' },
    data:{type:Object},
    type:{type:String},
    createdDate:{type:Date,default:Date.now},
}, { timestamps: true }
);

TokenSchema.methods.hasExpired=function(){
var now =new Date()
return (now -this.createdDate)>259200000;
}
/**
 * @typedef Token
 */

module.exports = mongoose.model('Token', TokenSchema);