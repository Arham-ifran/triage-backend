const AccountTier = require('../../models/accountTiers.model')
const { checkDuplicate } = require('../../../config/errors')
const Criteria = require("../../models/criteria.model")
const ObjectId = require('mongoose').Types.ObjectId



// API to get Account Levels
exports.listLevels = async (req, res, next) => {
    try {
        let { page, limit } = req.query
        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await AccountTier.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const accountLevels = await AccountTier.aggregate([
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
            success: true, message: 'Accounts List Fetched Successfully',
            data: {
                accountLevels,
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

// API to get account levels details
exports.accountLevelsDetail = async (req, res, next) => {
    try {
        let { searchLevel, searchSubLevel, searchCurrency,timePeriod,intrestPaid, key } = req.query


        intrestPaid = parseInt(intrestPaid)
        let  filter = {}

        if(searchLevel && searchLevel !== "undefined") {
            filter.accountTierId = ObjectId(searchLevel)
        }
        if(searchSubLevel && searchSubLevel !== "undefined") {
            filter.subLevel = parseInt(searchSubLevel)
        }
      
        if(timePeriod && timePeriod !== "undefined") {
            filter = {...filter, "profitInMonths.months" : timePeriod}
        }
       
        const accountLevels = await Criteria.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    _id: 1, 
                    subLevel:1,                    
                    profitInMonths:1
                }
            }
        ])

        return res.send({
            success: true, message: 'Account Levels Details Fetched Successfully',
            key,
            data: {
                accountLevels,
            },
            filter
        })
    } catch (error) {
        return next(error)
    }
}

exports.levelsMinInvestment = async (req, res, next) => {
    try {

        const {balance} = req.params
        let timePeriods = []
        let accountTier;

        const userCriteria = await Criteria.findOne({
            minInvestment : {$lte : balance},maxInvestment : {$gte : balance}
        });

        if(userCriteria) {
        accountTier = await AccountTier.findOne({ _id: userCriteria.accountTierId })
        }

        const bronzeLevel = await AccountTier.findOne({ level: 1 })
        const bronzeMinInvestment = await Criteria.findOne({ accountTierId: ObjectId(bronzeLevel._id) }, "minInvestment")

        const silverLevel = await AccountTier.findOne({ level: 2 })
        const silverMinInvestment = await Criteria.findOne({ accountTierId: ObjectId(silverLevel._id) }, "minInvestment")

        const goldLevel = await AccountTier.findOne({ level: 3 })
        const goldMinInvestment = await Criteria.findOne({ accountTierId: ObjectId(goldLevel._id) }, "minInvestment")

        const platinumLevel = await AccountTier.findOne({ level: 4 })
        const platinumMinInvestment = await Criteria.findOne({ accountTierId: ObjectId(platinumLevel._id) }, "minInvestment")

        const timePeriodData = await Criteria.find({}, 'profitInMonths')
        for (let index = 0; index < timePeriodData.length; index++) {
            const element = timePeriodData[index];
            timePeriods.push(element.profitInMonths)
        }


        return res.send({
            success: true,
            data: {
                bronzeMinInvestment: bronzeMinInvestment ? bronzeMinInvestment.minInvestment : 0,
                silverMinInvestment: silverMinInvestment ? silverMinInvestment.minInvestment : 0,
                goldMinInvestment: goldMinInvestment ? goldMinInvestment.minInvestment : 0,
                platinumMinInvestment: platinumMinInvestment ? platinumMinInvestment.minInvestment : 0,
                level: accountTier?.level ? accountTier?.level : 0,
                subLevel: userCriteria?.subLevel ? userCriteria?.subLevel : 0,
                userCriteria,
                timePeriods
            }
        })
    } catch (error) {
        return next(error)
    }
}