const fs = require('fs')
const ObjectId = require('mongoose').Types.ObjectId
const AddressBook = require('../../models/addressBook.model')
const { checkDuplicate } = require('../../../config/errors')

// API to create AddressBook
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        payload["userId"] = req.user
        const addressBook = await AddressBook.create(payload)
        return res.send({ success: true, message: 'AddressBook created successfully', addressBook })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'AddressBook')
        else
            return next(error)
    }
}

// API to edit AddressBook
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        let userId = req.user
        const isExist = await AddressBook.findOne({ _id: payload._id, userId: userId })
        if (!isExist){
            return res.status(400).send({ success: false, message: 'Un-authorized to edit!', addressBook: null })
        }        
        const addressBook = await AddressBook.findOneAndUpdate({ _id: payload._id, userId: userId }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'AddressBook updated successfully', addressBook })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'AddressBook')
        else
            return next(error)
    }
}

// API to delete AddressBook
exports.delete = async (req, res, next) => {
    try {
        const { Id } = req.params
        let userId = req.user
        if (Id) {
            const isExist = await AddressBook.findOne({ _id: Id, userId: userId })
            if (!isExist){
                return res.status(400).send({ success: false, message: 'Un-authorized to delete!', addressBook: null })
            }    
            const addressBook = await AddressBook.deleteOne({ _id: Id, userId: userId })
            if (addressBook && addressBook.deletedCount)
                return res.send({ success: true, message: 'AddressBook deleted successfully', addressBook })
            else return res.status(400).send({ success: false, message: 'AddressBook not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'AddressBook Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a AddressBook
exports.get = async (req, res, next) => {
    try {
        const { Id } = req.params
        let userId = req.user
        if (Id) {
            const isExist = await AddressBook.findOne({ _id: Id, userId: userId })
            if (!isExist){
                return res.status(400).send({ success: false, message: 'Un-authorized to get!', addressBook: null })
            }
            const addressBook = await AddressBook.findOne({ _id: Id }).lean(true)
            if (addressBook)
                return res.json({ success: true, message: 'AddressBook retrieved successfully', addressBook })
            else return res.status(400).send({ success: false, message: 'AddressBook not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'AddressBook Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get AddressBook list
exports.list = async (req, res, next) => {
    try {
        console.log("req.user = ", req.user)
        let { page, limit } = req.query
        let userId = req.user
        const filter = { userId: userId }
        console.log("user ID in request = ",userId)
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await AddressBook.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const cryptoAddressList = await AddressBook.find({ userId: userId, type: "crypto" }) 
        const bankAddressList = await AddressBook.find({ userId: userId, type: "bank" })

        // AddressBook.aggregate([
        //     { $match : {userId} },
        //     { $sort: { createdAt: -1 } },
        //     { $skip: limit * (page - 1) },
        //     { $limit: limit },
        // ])

        return res.send({
            success: true, message: 'AddressBook fetched successfully',
            data: {
                cryptoAddressList,
                bankAddressList,
                pagination: {
                    page, limit, total,
                    pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                }
            }
        })
    } catch (error) {
        return next(error)
    }
}