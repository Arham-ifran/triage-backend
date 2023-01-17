const Settings = require('../../models/settings.model')
const BankDetails = require("../../models/bankDetails.model")

// API to get Settings
exports.get = async (req, res, next) => {
    try {
        const settings = await Settings.findOne({}, { __v: 0, createdAt: 0, updatedAt: 0, api: 0, domain: 0 }).lean(true)
        if (settings)
            return res.json({ success: true, message: 'Settings retrieved successfully', settings })
        else
            return res.json({ success: false, message: settings })
    } catch (error) {
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