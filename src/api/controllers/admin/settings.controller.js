const Settings = require('../../models/settings.model')
const { checkDuplicate } = require('../../../config/errors')
const BankDetails = require("../../models/bankDetails.model")

// API to edit Settings
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body;
        const settings = await Settings.updateOne({}, { $set: payload }, { upsert: true })
        return res.send({ success: true, message: 'Settings updated successfully', settings })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Settings')
        else
            return next(error)
    }
}

// // API to get Settings
exports.get = async (req, res, next) => {
    try {
        const settings = await Settings.findOne({}, { __v: 0, createdAt: 0, updatedAt: 0 }).lean(true)
        if (settings)
            return res.json({ success: true, message: 'Settings retrieved successfully', settings })
        else
            return res.json({ success: false, message: settings })
    } catch (error) {
        return next(error)
    }
}


// API to edit Bank Details
exports.updateBankDetails = async (req, res, next) => {
    try {
        let payload = req.body;
        const details = await BankDetails.updateOne({}, { $set: payload }, { upsert: true })
        return res.send({ success: true, message: 'BankDetails updated successfully' })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'BankDetails')
        else
            return next(error)
    }
}


// API to get BankDetails 
exports.getBankDetails = async (req, res, next) => {
    try {
        const bankDetails = await BankDetails.findOne({}, { __v: 0, createdAt: 0, updatedAt: 0 }).lean(true)
        if (bankDetails)
            return res.json({ success: true, message: 'Bank Details retrieved successfully', bankDetails })
        else
            return res.json({ success: false })
    } catch (error) {
        return next(error)
    }
}