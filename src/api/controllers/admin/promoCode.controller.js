const fs = require('fs')
const ObjectId = require('mongoose').Types.ObjectId
const PromoCode = require('../../models/promoCode.model')
const { uploadToCloudinary } = require('../../utils/upload')
const { checkDuplicate } = require('../../../config/errors')

// API to create PromoCode
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        const promoCode = await PromoCode.create(payload)
        return res.send({ success: true, message: 'Promo Code created successfully', promoCode })
    } catch (error) {
        console.log(error)
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'PromoCode')
        else
            return next(error)
    }
}

// API to edit Promo Code
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        const promoCode = await PromoCode.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Promo Code updated successfully', promoCode })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Promo Code')
        else
            return next(error)
    }
}

// API to delete Promo Code
exports.delete = async (req, res, next) => {
    try {
        const { promoCodeId } = req.params
        if (promoCodeId) {
            const promoCode = await PromoCode.deleteOne({ _id: promoCodeId })
            if (promoCode && promoCode.deletedCount)
                return res.send({ success: true, message: 'Promo Code deleted successfully', promoCodeId })
            else return res.status(400).send({ success: false, message: 'Promo Code not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Promo Code Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a Promo Code
exports.get = async (req, res, next) => {
    try {
        const { promoCodeId } = req.params
        if (promoCodeId) {
            const promoCode = await PromoCode.findOne({ _id: promoCodeId }, {
                _id: 1, title: 1, status: 1, description: 1,
                NoOfTimesCodeAvailable: 1, codeType: 1, bonus: 1
            }).lean(true)
            if (promoCode)
                return res.json({ success: true, message: 'Promo Code retrieved successfully', promoCode })
            else return res.status(400).send({ success: false, message: 'promo Code not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'promo Code Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get Promo Codes list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, title, codeType, status } = req.query

        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10


        if (title) {
            filter.title = { $regex: title, $options: "gi" }
        }

        if (codeType) {
            filter.codeType = parseInt(codeType)
        }

        if (status) {
            if (status === 'true') {
                filter.status = true
            }
            else if (status === 'false') {
                filter.status = false
            }
        }


        const total = await PromoCode.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const promoCodes = await PromoCode.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, title: 1, status: 1, description: 1,
                    NoOfTimesCodeAvailable: 1, codeType: 1, bonus: 1
                }
            }
        ])

        return res.send({
            success: true, message: 'Promo Codes fetched successfully',
            data: {
                promoCodes,
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