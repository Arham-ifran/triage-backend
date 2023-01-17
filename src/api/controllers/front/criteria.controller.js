const AccountTiers = require('../../models/accountTiers.model')
const User = require('../../models/users.model')
const ObjectId = require('mongoose').Types.ObjectId
const Criteria = require('../../models/criteria.model')
const { checkDuplicate } = require('../../../config/errors')
const { defaultCurrency } = require('../../../config/vars')

// API to get Criteria List
exports.criteriaList = async (req, res, next) => {
    try {
        let { page, limit } = req.query
        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await Criteria.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const criteria = await Criteria.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'account-tiers',
                    foreignField: '_id',
                    localField: 'accountTierId',
                    as: 'criteria'
                }
            },
            { $unwind: { path: "$criteria", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, accountTierId: 1, subLevel: 1, currency: 1, minInvestment: 1, maxInvestment: 1,
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

// API to get All Criteria List
exports.list = async (req, res, next) => {
    try {

        let criteria = await Criteria.aggregate([
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
                    _id: 1, level: '$criteria.level', subLevel: 1, minInvestment: 1,
                    levelImage: '$criteria.image'
                }
            }
        ])

        if (criteria && criteria.length) {
            return res.send({
                success: true, message: 'Critera Fetched Successfully',
                criteria
            })
        }
        return res.send({
            success: true, message: 'No Critera Avaliable',
            criteria: []
        })
    } catch (error) {
        return next(error)
    }
}


// API to get Plans 
exports.getPlans = async (req, res, next) => {
    try {
        let { currency } = req.query
        let user = req.user
        let userDetails = await User.findOne({ _id: ObjectId(user) })


        // let accountTier = await AccountTiers.findOne({ level: userDetails.userLevel })
        // console.log("account tier  = ", accountTier)
        // if (!accountTier) return res.send({
        //     success: false, message: 'NO Account Tier Found for this level'
        // })

        const filter = {
            // accountTierId: ObjectId(accountTier._id),
            // subLevel: userDetails.userSubLevel,
            currency
        }

        const plans = await Criteria.find(filter)

        return res.send({
            success: true, message: 'Plans Fetched Successfully',
            data: {
                plans,
                filter
            }
        })
    } catch (error) {
        return next(error)
    }
}

exports.plansProfit = async (req, res, next) => {
    try {
        let { criteriaId } = req.query;

        const plansProfit = await Criteria.findOne({ _id: ObjectId(criteriaId) })
        const profitPlans = [
            {
                selectedCurrencyName: plansProfit.currency,
                months: plansProfit.months,
                minInvestment: plansProfit.minInvestment,
                profit: plansProfit.availableProfit,
                type: "available"
            },
            {
                selectedCurrencyName: plansProfit.currency,
                months: plansProfit.months,
                minInvestment: plansProfit.minInvestment,
                profit: plansProfit.lockedProfit,
                type: "locked"
            }
            
        ]



        return res.send({
            success: true, message: 'Plans Profit Fetched Successfully',
            data: {
                profitPlans
            }
        })
    } catch (error) {
        return next(error)
    }
}



