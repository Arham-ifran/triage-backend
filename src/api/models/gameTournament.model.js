const mongoose = require('mongoose');

/**
 * GameTournament Schema
 * @private
 */
const GameTournamentSchema = new mongoose.Schema({
    name: { type: String, required:true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Games' },
    description: { type: String },
    fee:  {type:String},
    players:  {type:String},
    gamePlay:  {type:Number},           // 1 = Real-time, 2 = async
    scoring:  {type:Number},            // 1 = high score wins , 2 low score win
    gameParamters:  {type:String},      //Json object
    EnvironmentType:{type:String},      // 1 = sandbox, 2 = production
    status :{type:Boolean,default:true},//(true,false)
}, { timestamps: true }
);

/**
 * @typedef GameTournament
 */

module.exports = mongoose.model('GameTournament', GameTournamentSchema);