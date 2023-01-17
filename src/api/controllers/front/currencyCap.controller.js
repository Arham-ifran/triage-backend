const CurrencyCap = require('../../models/currencyCap.model')
const ObjectId = require('mongoose').Types.ObjectId
const vars = require("../../../config/vars")
const Wallet = require("../../models/wallets.model")
const Stake = require("../../models/stake.model")
const Stats = require("../../models/profitStats.model")

// API to get currency value in usd
exports.get = async (req, res, next) => {
    try {
        let { symbol } = req.query
        let currencyCap;
        let walletList;
        if (symbol) {
            symbol = symbol.toUpperCase()
            currencyCap = await CurrencyCap.findById({ _id: vars.currencyCapObjectId }, { [`${symbol}InUSD`]: 1 })
        } else {
            walletList = await Wallet.find({}, { logo: 1, symbol: 1, networkId: 1, type: 1, walletAddress: 1 })
            currencyCap = await CurrencyCap.findById({ _id: vars.currencyCapObjectId })
        }

        return res.send({
            success: true, message: 'Currency Value fetched successfully',
            data: {
                currencyCap, walletList
            }
        })
    } catch (error) {
        return next(error)
    }
}


//currency amount deposit profit

// API to get currency value in usd
exports.listStats1 = async (req, res, next) => {
    try {
        let { symbol, type } = req.query
        let userId = req.user
        let symbolFilter = { symbol: '' }

        if (symbol)
            symbolFilter = { symbol }

      
        let filters = {
            userId: ObjectId(`${userId}`)
        }
        if (type = 1)
            filters.profitType = 3;

        if (type = 2)
            filters.profitType = { $in: [1, 2] }

        let data = await Stake.aggregate([
            { $match: filters },
            {
                $lookup: {
                    from: 'criterias',
                    foreignField: '_id',
                    localField: 'criteriaId',
                    as: 'criteria'
                }
            },
            { $unwind: { path: "$criteria", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$criteria.currency",
                    totalProfitAmount: { $sum: "$profitAmount" },
                    "depositedAmount": { "$first": "$depositedAmount" }
                }
            }
        ]);

        return res.send({
            success: true, message: 'Currency Stats Fetched Successfully',
            // listStats,
            data
        })
    } catch (error) {
        return next(error)
    }
}

exports.listStats = async(req,res,next) => {
    try {        

        let userId = req.user

        let availableProfitFilter = {
             stakeEndDate: { $gte: new Date() },
             availableProfit: {$exists: true},
             userId: ObjectId(userId)
            }

            let lockedProfitFilter = { 
                stakeEndDate: {$eq: new Date()},
                lockedProfit: {$exists: true},
                userId: ObjectId(userId)
            }

        let availableProfitStats = await Stats.find(availableProfitFilter)
        let lockedProfitStats = await Stats.find(lockedProfitFilter)
        return res.status(200).send({success: true, message: "Stats fetched Successfully", data: {availableProfitStats,lockedProfitStats} })

        
    } catch (error) {
        return next(error)
    }
}