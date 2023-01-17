const mongoose = require('mongoose');

/**
 * GameThemes Schema
 * @private
 */
const GamesThemesSchema = new mongoose.Schema({
    name: { type: String, required:true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Games' },
    coreColor:  {type:String},
    accentColor:  {type:String},
    buttons:  {type:String},
    text:  {type:String},
    artwork:  {type:String},
    advanced:  {type:String},
    status :{type:Boolean},//(true,false)
}, { timestamps: true }
);

/**
 * @typedef GameThemes
 */



module.exports = mongoose.model('GameThemes', GamesThemesSchema);