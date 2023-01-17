const AccountTier = require('../../models/accountTiers.model')
const Criteria = require("../../models/criteria.model")
const { checkDuplicate } = require('../../../config/errors')
const { uploadToCloudinary } = require('../../utils/upload');
const ObjectId = require('mongoose').Types.ObjectId


// API to create AccountTier
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        if (req.files) {
            for (const key in req.files) {
                const image = req.files[key][0]
                payload[key] = await uploadToCloudinary(image.path)
                payload[`${key}Local`] = image.filename
            }
        }
        const content = await AccountTier.create(payload)
        return res.status(200).send({ success: true, message: 'Account Tier created successfully', content })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'account-tiers')
        else
            return next(error)
    }
}

// API to edit AccountTier
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        if (req.files) {
            for (const key in req.files) {
                const image = req.files[key][0]
                payload[key] = await uploadToCloudinary(image.path)
                payload[`${key}Local`] = image.filename
            }
        }
        const content = await AccountTier.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Account Tier updated successfully', content })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'account-tiers')
        else
            return next(error)
    }
}

// API to delete AccountTier
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params
        if (id) {
            const accountTier = await AccountTier.deleteOne({ _id: id })
            await Criteria.deleteMany({ accountTierId: ObjectId(id) })
            if (accountTier && accountTier.deletedCount)
                return res.send({ success: true, message: 'Account Tier deleted successfully', accountTierId: id })
            else return res.status(400).send({ success: false, message: 'Account Tier not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Account Tier Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a AccountTier
exports.get = async (req, res, next) => {
    try {
        const { id } = req.params
        if (id) {
            const accountTier = await AccountTier.findOne({ _id: id }, { _id: 1, level: 1, maxSubLevel: 1, image: 1 }).lean(true)
            if (accountTier)
                return res.json({ success: true, message: 'Account Tier retrieved successfully', accountTier })
            else return res.status(400).send({ success: false, message: 'Account Tier not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Account Tier Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get AccountTier list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, level } = req.query
        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (level)
            filter.level = parseInt(level)

        const total = await AccountTier.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const accountTier = await AccountTier.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, level: 1, maxSubLevel: 1, image: 1
                }
            }
        ])

        return res.send({
            success: true, message: 'Account Tier Fetched Successfully',
            data: {
                accountTier,
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