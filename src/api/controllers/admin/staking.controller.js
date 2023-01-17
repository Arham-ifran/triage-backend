const Stake = require('../../models/stake.model')
const ObjectId = require('mongoose').Types.ObjectId
const moment = require("moment")
const Wallet = require('../../models/wallets.model')
const TokensWallet = require("../../models/tokensWallet.model")
const env = require("../../../config/vars")
const erc20Abi = require("../../utils/abi/erc20.json")
const trgAbi = require("../../utils/abi/token.json")
const { sendProfit, sendAmountToAdmin } = require("../../utils/web3")
const { chainsConfigs, diffInDays } = env

// API to list Staking
exports.list = async (req, res, next) => {
    try {
        let { page, limit, firstName, lastName, codeType, status } = req.query
        const filter = {}

        if (firstName)
            filter['user.firstName'] = { $regex: firstName, $options: "gi" }

        if (lastName)
            filter['user.lastName'] = { $regex: lastName, $options: "gi" }

        if (codeType) {
            filter.profitType = parseInt(codeType)
        }

        if (status) {
            if (status === 'true') {
                filter.stakeEndDate = { $lt: new Date() }
            }
            else if (status === 'false') {
                filter.stakeEndDate = { $gt: new Date() }
            }
        }



        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10


        const total = await Stake.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const stake = await Stake.aggregate([
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'userId',
                    as: 'user'
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            { $match: filter },
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
                $lookup: {
                    from: 'account-tiers',
                    foreignField: '_id',
                    localField: 'criteria.accountTierId',
                    as: 'accountTiers'
                }
            },
            { $unwind: { path: "$accountTiers", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, userFirstName: '$user.firstName', userLastName: '$user.lastName',
                    depositedAmount: 1, totalProfit: 1, interestPaid: 1, stakeEndDate: 1,
                    promoCode: 1, profitAmount: 1, profitAmountPaid: 1, profitType: 1,
                    level: '$accountTiers.level', subLevel: '$criteria.subLevel',
                    currency: 1, months: 1
                }
            }
        ])

        return res.send({
            success: true, message: 'Staking Fetched Successfully',
            data: {
                stake,
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

// API to list Staking
exports.recList = async (req, res, next) => {
    try {
        let { page, limit, firstName, lastName } = req.query
        const filter = {}

        if (firstName)
            filter['user.firstName'] = { $regex: firstName, $options: "gi" }

        if (lastName)
            filter['user.lastName'] = { $regex: lastName, $options: "gi" }


        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10


        const total = await Stake.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const stake = await Stake.aggregate([
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'userId',
                    as: 'user'
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'tokenswallets',
                    foreignField: 'userId',
                    localField: 'userId',
                    as: 'tokenswallets'
                }
            },
            { $unwind: { path: "$tokenswallets", preserveNullAndEmptyArrays: true } },
            { $match: filter },
            {
                $lookup: {
                    from: 'criterias',
                    foreignField: '_id',
                    localField: 'criteriaId',
                    as: 'criteria'
                }
            },
            { $unwind: { path: "$criteria", preserveNullAndEmptyArrays: true } },
            // {
            //     $lookup: {
            //         from: 'account-tiers',
            //         foreignField: '_id',
            //         localField: 'criteria.accountTierId',
            //         as: 'accountTiers'
            //     }
            // },
            // { $unwind: { path: "$accountTiers", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    // _id: {
                    //     'currency': '$criteria.currency',
                    //     'userId': '$user._id'
                    // },
                    id: 1,
                    userFirstName: '$user.firstName',
                    userLastName: '$user.lastName',
                    userWalletAddress: '$tokenswallets',
                    depositedAmount: 1,
                    // totalProfit: { '$first': '$totalProfit' },
                    // interestPaid: { '$first': '$interestPaid' },
                    // stakeEndDate: { '$first': '$stakeEndDate' },
                    // level: { '$first': '$accountTiers.level' },
                    // subLevel: { '$first': '$criteria.subLevel' },
                    currency: '$criteria.currency',
                    contractAddress: '$criteria.tokenAddress',
                    transferToAdmin: 1,
                    // months: { '$first': '$criteria.months' },
                    // totalAmount: { $sum: '$profitAmount' }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit }
        ])

        return res.send({
            success: true, message: 'Staking Fetched Successfully',
            data: {
                stake,
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

// calculate the stake amount interest and send the profit if available
exports.sendStakedInterest = async (req, res, next) => {
    try {
        const { stakeId } = req.body

        // and interest paid is false
        let dbQuery = [
            {
                $match: {
                    _id: ObjectId(stakeId),
                }
            },
            {
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
                $project: {
                    _id: 1,
                    userId: 1,
                    depositedAmount: 1,
                    monthlyInterest: 1,
                    yearlyInterest: 1,
                    totalInterest: 1,
                    totalToBeReceived: 1,
                    totalProfit: 1,
                    profitType: 1,
                    profitAmount: 1,
                    stakeEndDate: 1,
                    profitAmountPaid: 1,
                    months: `$criteriaObj.months`,
                    currency: `$criteriaObj.currency`,
                    tokenAddress: `$criteriaObj.tokenAddress`,
                    availableProfit: `$criteriaObj.availableProfit`,
                    lockedProfit: `$criteriaObj.lockedProfit`,
                    lockedProfitInPrimaryCurrency: `$criteriaObj.lockedProfitInPrimaryCurrency`
                }
            },
        ]
        const stakeList = await Stake.aggregate(dbQuery)
        // console.log("stakeObj = ", stakeList[0])

        let stakeObj = stakeList[0]
        if (stakeObj.profitType === 1) {
            if (moment(stakeObj.stakeEndDate).isBefore(new Date())) {
                const profitSent = await sendProfitInLockedCurrency(stakeObj)
                if (profitSent) {
                    return res.send({ success: true, message: 'Staked Sent successfully', stakeObj })
                }
            } else {
                return res.send({ success: false, message: 'Cant Able to send profit interest.', stakeObj })
            }
        } else if (stakeObj.profitType === 2) {
            if (moment(stakeObj.stakeEndDate).isBefore(new Date())) {
                console.log("sendProfitInPrimaryCurrency")
                const profitSent = await sendProfitInPrimaryCurrency(stakeObj)
                if (profitSent) {
                    return res.send({ success: true, message: 'Staked Sent successfully', stakeObj })
                }
            } else {
                return res.send({ success: false, message: 'Cant Able to send profit interest.', stakeObj })
            }
        } else if (stakeObj.profitType === 3) {
            console.log("send available profit")
            const profitSent = await sendAvailableprofit(stakeObj)
            console.log("profit sent - 🌜", profitSent)
            if (profitSent) {
                return res.send({ success: true, message: 'Staked Sent successfully', stakeObj })
            } else {
                return res.send({ success: false, message: 'Cant Able to send profit interest.', stakeObj })
            }
        } else { }
    } catch (error) {
        return next(error)
    }
}

// fn to send profit in locked currency profitType = 1
const sendProfitInLockedCurrency = async (obj) => {
    const { currency, userId, profitAmount } = obj

    // get the wallet address from the env
    const wallet = await Wallet.findOne({ symbol: currency })

    // get user token wallet address 
    const tokenWalletAddress = await TokensWallet.findOne({ userId: userId })

    let receiverAddress = null

    // check the wallet network id
    if (wallet.networkId === 5) {
        receiverAddress = tokenWalletAddress.ethereum
    } else if (wallet.networkId === 97) {
        receiverAddress = tokenWalletAddress.ethereum
    } else if (wallet.networkId === 1) {
        receiverAddress = tokenWalletAddress.ethereum
    } else { }

    // send profit to user wallet
    // contractAddress, contractABI, amount, senderAddress, senderPrivateKey, receiverAddress, networkId
    const res = await sendProfit(wallet.walletAddress, erc20Abi, profitAmount, chainsConfigs[wallet.networkId].ownerAddress, chainsConfigs[wallet.networkId].ownerPrivateKey, receiverAddress, wallet.networkId)
    console.log("res = ", res)
    if (res.status) {
        await Stake.findByIdAndUpdate({ _id: obj._id }, { interestPaid: true, profitAmountPaid: profitAmount }) //profit amount updated
        return true
    } else {
        return false
    }
}

// fn to send profit in primary currency profitType = 2
const sendProfitInPrimaryCurrency = async (obj) => {
    const { currency, userId, profitAmount } = obj

    // get the wallet address from the env
    const wallet = await Wallet.findOne({ symbol: currency })

    // get user token wallet address 
    const tokenWalletAddress = await TokensWallet.findOne({ userId: userId })

    let receiverAddress = null

    // check the wallet network id
    if (wallet.networkId === 5) {
        receiverAddress = tokenWalletAddress.ethereum
    } else if (wallet.networkId === 97) {
        receiverAddress = tokenWalletAddress.ethereum
    } else if (wallet.networkId === 1) {
        receiverAddress = tokenWalletAddress.ethereum
    } else { }

    // send profit to user wallet
    // contractAddress, contractABI, amount, senderAddress, senderPrivateKey, receiverAddress, networkId
    const res = await sendProfit(chainsConfigs[wallet.networkId].primaryToken.address, trgAbi, profitAmount, chainsConfigs[wallet.networkId].ownerAddress, chainsConfigs[wallet.networkId].ownerPrivateKey, receiverAddress, wallet.networkId)
    if (res.status) {
        await Stake.findByIdAndUpdate({ _id: obj._id }, { interestPaid: true, profitAmountPaid: profitAmount }) //profit amount updated
        return true
    } else {
        return false
    }
}

// fn to send available profit on daily basis profitType = 3
const sendAvailableprofit = async (obj) => {
    const { profitAmountPaid, stakeStartDate, totalProfit, depositedAmount, userId, currency } = obj

    // calculate the days till now from the stake start date
    const start = stakeStartDate
    const end = moment();
    const days = await diffInDays(start, end) //end.diff(start, "days")

    if (days <= 0) {
        return false;
    }

    let accProfitAmount = 0
    let stakeAmt = parseFloat(depositedAmount)
    let profitAmt = stakeAmt * totalProfit / 100

    console.log("profitAmt = 😃", profitAmt)

    let dailyProfit = profitAmt // 365

    console.log("days = 😃", days)

    for (let index = 0; index < days; index++) {
        if (dailyProfit > 0) {
            console.log("🛩️", accProfitAmount, dailyProfit)
            accProfitAmount = parseFloat(accProfitAmount) + parseFloat(dailyProfit)
            console.log("🛩️", accProfitAmount)
        } else { }
    }

    let profitAmount = parseFloat(accProfitAmount)
    console.log("profitAmountprofitAmountprofitAmountprofitAmount = 😃", profitAmount)

    // send profit to stake holder transaction would be there *****

    // get the wallet address from the env
    const wallet = await Wallet.findOne({ symbol: currency })

    // get user token wallet address 
    const tokenWalletAddress = await TokensWallet.findOne({ userId: userId })

    let receiverAddress = null

    // check the wallet network id
    if (wallet.networkId === 5) {
        receiverAddress = tokenWalletAddress.ethereum
    } else if (wallet.networkId === 97) {
        receiverAddress = tokenWalletAddress.ethereum
    } else if (wallet.networkId === 1) {
        receiverAddress = tokenWalletAddress.ethereum
    } else { }

    console.log("profitAmountprofitAmountprofitAmountprofitAmount = 😃", profitAmount)

    // send profit to user wallet
    // contractAddress, contractABI, amount, senderAddress, senderPrivateKey, receiverAddress, networkId
    const res = await sendProfit(chainsConfigs[wallet.networkId].primaryToken.address, trgAbi, profitAmount, chainsConfigs[wallet.networkId].ownerAddress, chainsConfigs[wallet.networkId].ownerPrivateKey, receiverAddress, wallet.networkId)
    if (res.status) {
        await Stake.findByIdAndUpdate({ _id: obj._id }, { interestPaid: true, profitAmountPaid: profitAmountPaid + profitAmount }) //profit amount updated
        return true
    } else {
        return false
    }
}

// get amount to admin
exports.getAmountToAdmin = async (req, res, next) => {
    try {
        const { stakeId } = req.body
        let dbQuery = [
            {
                $match: {
                    _id: ObjectId(stakeId),
                }
            },
            {
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
                $lookup: {
                    from: 'tokenswallets',
                    foreignField: 'userId',
                    localField: 'userId',
                    as: 'tokenswallets'
                }
            },
            { $unwind: { path: "$tokenswallets", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    depositedAmount: 1,
                    // monthlyInterest: 1,
                    // yearlyInterest: 1,
                    // totalInterest: 1,
                    // totalToBeReceived: 1,
                    // totalProfit: 1,
                    // profitType: 1,
                    // profitAmount: 1,
                    // stakeEndDate: 1,
                    // profitAmountPaid: 1,
                    // months: `$criteriaObj.months`,
                    userWalletAddress: '$tokenswallets',
                    currency: `$criteriaObj.currency`,
                    tokenAddress: `$criteriaObj.tokenAddress`,
                    // availableProfit: `$criteriaObj.availableProfit`,
                    // lockedProfit: `$criteriaObj.lockedProfit`,
                    // lockedProfitInPrimaryCurrency: `$criteriaObj.lockedProfitInPrimaryCurrency`
                }
            },
        ]
        const stakeList = await Stake.aggregate(dbQuery)
        let stake = stakeList[0]

        // get the wallet address from the env
        const wallet = await Wallet.findOne({ symbol: stake.currency || 'TRI'})

        // get user token wallet address 
        const tokenWalletAddress = await TokensWallet.findOne({ userId: stake.userId })

        let senderAddress = null
        let senderPrivateKey = null

        // check the wallet network id
        if (wallet.networkId === 5) {
            senderAddress = tokenWalletAddress.ethereum
            senderPrivateKey = tokenWalletAddress.ethereumPrivateKey
        } else if (wallet.networkId === 97) {
            senderAddress = tokenWalletAddress.ethereum
            senderPrivateKey = tokenWalletAddress.ethereumPrivateKey
        } else if (wallet.networkId === 1) {
            senderAddress = tokenWalletAddress.ethereum
            senderPrivateKey = tokenWalletAddress.ethereumPrivateKey
        } else { }

        // send amount to admin address
        // contractAddress, contractABI, amount, senderAddress, senderPrivateKey, receiverAddress, networkId
        const resTx = await sendAmountToAdmin(wallet.walletAddress, erc20Abi, stake.depositedAmount, senderAddress, senderPrivateKey, chainsConfigs[wallet.networkId].ownerAddress, wallet.networkId)

        if (resTx.status) {
            await Stake.findByIdAndUpdate({ _id: stakeId }, { transferToAdmin: true }) //amount transfer
            return res.send({ success: true, message: 'Amount Transfered successfully.' })
        } else {
            return res.send({ success: false, message: 'Amount Transfered Failed.' })
        }

    } catch (error) {
        return next(error)
    }
}