const mongoose = require('mongoose');

/**
 * Tournament Schema
 * @private
 */
const TournamentSchema = new mongoose.Schema({
    name: { type: String, required:true },
    description: { type: String },
    fee:  {type:String},
    players:  {type:String},
    gamePlay:  {type:Number},           // 1 = Real-time, 2 = async
    scoring:  {type:Number},            // 1 = high score wins , 2 low score win
    gameParameters:  {type:Array},      //Array object
    environmentType:{type:String},      // 1 = sandbox, 2 = production
    status :{type:Boolean,default:true},//(true,false)
}, { timestamps: true }
);

/**
 * @typedef Tournament
 */

module.exports = mongoose.model('Tournament', TournamentSchema);