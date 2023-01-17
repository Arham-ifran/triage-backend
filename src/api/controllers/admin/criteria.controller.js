const AccountTiers = require('../../models/accountTiers.model')
const ObjectId = require('mongoose').Types.ObjectId
const Criteria = require('../../models/criteria.model')
const { checkDuplicate } = require('../../../config/errors')
const Wallet = require("../../models/wallets.model")

// API to create Criteria 
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        if (payload.profitInMonths) {
            payload.profitInMonths = JSON.parse(payload.profitInMonths)
        }
        payload.accountTierId = ObjectId(payload.accountTierId)
        let getCriteria = await Criteria.find({ accountTierId: ObjectId(payload.accountTierId), subLevel: parseInt(payload.subLevel) })
        if (getCriteria && getCriteria.length) {
            return res.status(400).send({ success: false, message: 'Sub Level Already Exist.' })
        }
        const criteria = await Criteria.create(payload)
        return res.status(200).send({ success: true, message: 'Criteria created successfully', criteria })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'criteria')
        else
            return next(error)
    }
}

// API to edit Criteria
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        if (payload.profitInMonths) {
            payload.profitInMonths = JSON.parse(payload.profitInMonths)
        }
        const content = await Criteria.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Criteria updated successfully', content })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'criteria')
        else
            return next(error)
    }
}

// API to get FaqCategories list
exports.listAccountTiers = async (req, res, next) => {
    try {
        let accountTiers = await AccountTiers.find({}, { level: 1, maxSubLevel: 1 })

        return res.send({
            success: true, message: 'Account-Tiers Fetched Successfully',
            accountTiers
        })
    } catch (error) {
        return next(error)
    }
}

// API to get Criteria List
exports.list = async (req, res, next) => {
    try {
        let { page, limit, level, searchSubLevel } = req.query
        let filter = {}

        if (level)
            filter = { 'criteria.level': parseInt(level) }

        if (searchSubLevel)
            filter.subLevel = parseInt(searchSubLevel)

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        let total = await Criteria.aggregate([
            {
                $lookup: {
                    from: 'account-tiers',
                    foreignField: '_id',
                    localField: 'accountTierId',
                    as: 'criteria'
                }
            },
            { $unwind: { path: "$criteria", preserveNullAndEmptyArrays: true } },
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ])

        total = total.length


        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const criteria = await Criteria.aggregate([
            {
                $lookup: {
                    from: 'account-tiers',
                    foreignField: '_id',
                    localField: 'accountTierId',
                    as: 'criteria'
                }
            },
            { $unwind: { path: "$criteria", preserveNullAndEmptyArrays: true } },
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, level: '$criteria.level', subLevel: 1,
                    minInvestment: 1, maxInvestment: 1, profitInMonths: 1
                }
            }
        ])

        return res.send({
            success: true, message: 'Critera Fetched Successfully',
            data: {
                criteria,
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

// API to get Criteria List
exports.get = async (req, res, next) => {
    try {
        let { id } = req.params

        let criteria = await Criteria.aggregate([
            { $match: { _id: ObjectId(id) } },
            {
                $lookup: {
                    from: 'account-tiers',
                    foreignField: '_id',
                    localField: 'accountTierId',
                    as: 'criteria'
                }
            },
            { $unwind: { path: "$criteria", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1, level: '$criteria.level', subLevel: 1, minInvestment: 1, maxInvestment: 1, profitInMonths: 1
                }
            }
        ])

        if (criteria && criteria.length)
            criteria = criteria[0]

        return res.send({
            success: true, message: 'Critera Fetched Successfully',
            criteria
        })
    } catch (error) {
        return next(error)
    }
}

// API to delete Criteria
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params
        if (id) {
            const criteria = await Criteria.deleteOne({ _id: ObjectId(id) })
            if (criteria && criteria.deletedCount)
                return res.send({ success: true, message: 'Criteria deleted successfully', criteriaId: id })
            else return res.status(400).send({ success: false, message: 'Criteria not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Criteria Id is required' })
    } catch (error) {
        return next(error)
    }
}