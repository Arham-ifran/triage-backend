const fs = require('fs')
const ObjectId = require('mongoose').Types.ObjectId
const Stake = require("../../models/stake.model");
const Stats = require("../../models/profitStats.model")
const moment = require("moment");
const Criteria = require("../../models/criteria.model")
const { diffInDays, chainsConfigs } = require("../../../config/vars")
const History = require("../../models/history.model")
const PromoCode = require("../../models/promoCode.model");
const UsedPromoCode = require("../../models/usedPromoCodes.model");
const Tokenswallets = require("../../models/tokensWallet.model")
const Wallet = require("../../models/wallets.model")
const erc20Abi = require("../../utils/abi/erc20.json")
const { sendAmountToAdmin } = require("../../utils/web3")

exports.create = async (req, res, next) => {
    try {

        let payload = req.body
        payload.stakeStartDate = moment()
        payload.stakeEndDate = moment().add(payload.months, 'M');
      
        // Profit Calculation 
        let totalProfit;
        let profit = (parseFloat(payload.depositedAmount) * parseFloat(payload.totalProfit)) / 100
        // Add Promo Code Profit too if any used
        if (req.body.promoCode) {
            const promo = await PromoCode.findOne({ title: req.body.promoCode })
            let promoProfit = (parseFloat(payload.depositedAmount) * parseFloat(promo.bonus)) / 100
            profit += promoProfit
            await PromoCode.findByIdAndUpdate({ _id: promo._id }, { $inc: { NoOfTimesCodeAvailable: -1 } })
            let usedPromo = await UsedPromoCode.findOne({ userId: req.body.userId, promoCodeId: promo._id })
            if (usedPromo) {
                await UsedPromoCode.findByIdAndUpdate({ _id: usedPromo._id }, { $inc: { noOfTimesUsed: 1 } });
               
            }
            else {
                await UsedPromoCode.create({ userId: req.body.userId, promoCodeId: promo._id, noOfTimesUsed: 1 })
            }
            await History.create({
                receiverId: req.body.userId,
                promoCodeId: promo._id,
                // bonusType: 2,
                historyType: 5
            })
        }

        totalProfit = profit + parseFloat(payload.depositedAmount)
        if(payload.profitType === 1) {
            const start = moment()
            const end = moment(payload.stakeEndDate);
            const days = await diffInDays(start, end)
            payload.dailyProfit = totalProfit / days
        }
        payload.totalToBeReceived = totalProfit

        // Transfer Staked Amount to Admin
        let userWalletData = await Tokenswallets.findOne({ userId: ObjectId(payload.userId) })
        let tokenData = await Wallet.findOne({ name: "TRI" })

        const transactionRes = await sendAmountToAdmin(tokenData.walletAddress, erc20Abi, payload.depositedAmount, userWalletData.ethereum, userWalletData.ethereumPrivateKey, chainsConfigs[tokenData.networkId].ownerAddress, tokenData.networkId)
        if (transactionRes.status) {
            payload.transferToAdmin = true;
            const stakedCurrencyData = await Stake.create(payload)
            return res.send({ success: true, message: 'Currency staked successfully', data: stakedCurrencyData })
        } else {
            return res.send({ success: false, message: 'Something went wrong!' })
        }
    } catch (error) {
        return next(error)
    }
}

exports.getStakeAmount = async (req, res, next) => {
    try {
        let userId = req.user

        let currencyName = null
        const { tokenAddress } = req.query

        let currentDate = new Date()

        let dbQuery = [
            {
                $match: {
                    userId: ObjectId(userId),
                    // interestPaid: false,
                    stakeEndDate: { $gt: currentDate }
                }
            }, {
                $lookup: {
                    from: 'criterias',
                    foreignField: '_id',
                    localField: 'criteriaId',
                    as: 'criteriaObj'
                }
            },
            {
                $unwind: '$criteriaObj',
            },
            {
                $match: {
                    'criteriaObj.tokenAddress': tokenAddress
                }
            },
            {
                $project: {
                    _id: '_id',
                    depositedAmount: 1,
                    monthlyInterest: 1,
                    yearlyInterest: 1,
                    totalInterest: 1,
                    totalToBeReceived: 1,
                    totalProfit: 1
                }
            },
        ]

        const stakeAmount = await Stake.aggregate(dbQuery)
        // need to calculate the total stacked amount

        let overAllDespositedAmount = 0

        // sum all the deposited amount 
        for (let index = 0; index < stakeAmount.length; index++) {
            const element = stakeAmount[index];
            overAllDespositedAmount = overAllDespositedAmount + element.depositedAmount
        }

        let data = {
            totalAmountStaked: overAllDespositedAmount,
            currencyName,
        }

        return res.send({ success: true, message: 'Total Staked Amount.', data })
    } catch (error) {
        return next(error)
    }
}

exports.sendProfitCron = async (req, res, next) => {
    try {

        // Handle Available Profit
        let availableProfitFilter = { stakeEndDate: { $gte: new Date() } }
        let users = await Stake.find(availableProfitFilter)
        if(users.length>0) {
            for (let index = 0; index < users.length; index++) {
                const user = users[index];
                let profitAmount = user.dailyProfit;
    
                let userStats = await Stats.findOne({userId: ObjectId(user.userId)})
                if(user?.profitType === 1) {    
                if(userStats) {
                    await Stats.findOneAndUpdate({userId: ObjectId(user.userId)}, {
                        userId: ObjectId(user.userId),
                        $inc: { availableProfit: profitAmount },
                        stakeStartDate: user.stakeStartDate,
                        stakeEndDate: user.stakeEndDate,
                        depositedAmount: user.depositedAmount
                    },
                    {upsert: true}
                    )
                }
                else {
                    await Stats.create({
                        userId: ObjectId(user.userId),
                        availableProfit: profitAmount ,
                        stakeStartDate: user.stakeStartDate,
                        stakeEndDate: user.stakeEndDate,
                        depositedAmount: user.depositedAmount
                    })
                }
                }
    
            }
        }
      
        // Handle Locked Profit
        let lockedProfitFilter = { stakeEndDate: {$eq: new Date()}}
        let usersData = await Stake.find(lockedProfitFilter)
        if(usersData.length > 0) {
            for (let index = 0; index < usersData.length; index++) {
                const element = usersData[index];
                let lockedProfitAmount = element.totalToBeReceived
                let userStats = await Stats.findOne({userId: ObjectId(element.userId)})
                if(element?.profitType === 2) {    
                    if(userStats) {
                        await Stats.findOneAndUpdate({userId: ObjectId(element.userId)}, {
                            userId: ObjectId(element.userId),
                            $inc: { lockedProfit: lockedProfitAmount },
                            stakeStartDate: element.stakeStartDate,
                            stakeEndDate: element.stakeEndDate,
                            depositedAmount: element.depositedAmount

                        },
                        {upsert: true}
                        )
                    }
                    else {
                        await Stats.create({
                            userId: ObjectId(element.userId),
                            lockedProfit: lockedProfitAmount ,
                            stakeStartDate: element.stakeStartDate,
                            stakeEndDate: element.stakeEndDate,
                            depositedAmount: element.depositedAmount
                        })
                    }
                    }
            }  
        }


        return res.status(200).send({message: "Stats Updated!"})
        
       
    }
    catch (error) {
        return next(error)
    }
}

exports.fetchUserProfit = async(req,res,next) => {
    try {
        let userId = req.user;
        let calculatedProfit;


        const userProfit = await Stats.findOne({userId: ObjectId(userId)})
        let availableProfit = userProfit?.availableProfit ? userProfit.availableProfit : 0;
        let lockedProfit = userProfit?.lockedProfit ? userProfit.lockedProfit : 0;
        calculatedProfit = availableProfit + lockedProfit;

        return res.status(200).send({
            message: "Profit Fetched",
            success: true,
            data: calculatedProfit
        })


    } catch (error) {
        return next(error)
    }
}