const fs = require('fs')
const ObjectId = require('mongoose').Types.ObjectId
const Security = require('../../models/security.model')
const User = require('../../models/users.model')
const { checkDuplicate } = require('../../../config/errors')

// API to create Security
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        const userId = req.user
        payload["userId"] = userId
        const isExist = await Security.findOne({ userId: userId })
        let security = null

        if(isExist){
            security = await Security.findOneAndUpdate({ userId: payload.userId }, { $set: payload }, { new: true })
        }else {
            security = await Security.create(payload)
        }
        return res.send({ success: true, message: 'Security Updated Successfully.', security })
    } catch (error) {
        console.log(error)
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Security')
        else
            return next(error)
    }
}

// API to get a Security
exports.get = async (req, res, next) => {
    try {
        const userId = req.user
        if (userId) {
            console.log("hello = ", userId )
            const security = await Security.findOne({ userId: userId })
            return res.json({ success: true, message: 'Security retrieved successfully', security })
        } else
            return res.status(400).send({ success: false, message: 'User Id is required' })
    } catch (error) {
        return next(error)
    }
}
