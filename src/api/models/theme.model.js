const mongoose = require('mongoose');

/**
 * Theme Schema
 * @private
 */
const ThemeSchema = new mongoose.Schema({
    name: { type: String, required:true },
    coreColor:  {type:String},
    accentColor:  {type:String},
    buttons:  {type:String},
    text:  {type:String},
    artwork:  {type:String},
    advanced:  {type:String},
    status :{type:Boolean,default:true},//(true,false)
}, { timestamps: true }
);

/**
 * @typedef Theme
 */

module.exports = mongoose.model('Theme', ThemeSchema);