const WireRequest = require("../../models/wirerequest.model")
const ObjectId = require('mongoose').Types.ObjectId
const History = require("../../models/history.model")
const User = require("../../models/users.model")
const Tokenswallets = require("../../models/tokensWallet.model");
const PromoCode = require("../../models/promoCode.model");
const UsedPromoCode = require("../../models/usedPromoCodes.model");
const Wallet = require("../../models/wallets.model");
const { transferToken } = require("../../controllers/front/payment.controller")
const witdrawRequest = require("../../models/withdrawalrequest.model")
const { uploadToCloudinary } = require('../../utils/upload');
const Stats = require("../../models/profitStats.model")
const { getBalanceOfToken } = require("../../utils/web3")
const erc20Abi = require("../../utils/abi/erc20.json")
const {  sendAmountToAdmin } = require("../../utils/web3")
const env = require("../../../config/vars")
const { chainsConfigs, diffInDays } = env




exports.fetchWireRequests = async (req, res, next) => {
    try {
        let { page, limit, userName, userEmail, depositedAmount, promoCode, depositAmountCredited, status } = req.body
        let total = 0;
        const filter = {}
        const finalFilter = {}
        if(status){
            filter.status = parseInt(status);
        }
        if(userName){
            finalFilter.userName = userName;
            const n = await User.countDocuments({firstName: userName})
            if(n > total)
                total = n;
            }
        if(userEmail){
            finalFilter.userEmail = userEmail;
            const e = await User.countDocuments({email: userEmail})
            if(e > total)
                total = e;
            }
        if(depositedAmount){
            finalFilter.depositedAmount = parseFloat(depositedAmount);
            const das = await History.countDocuments({depositAmountSent: depositedAmount})
            if(das > total)
                total = das;
        }
        if(promoCode){
            finalFilter.promoCode = promoCode;
            const p = await PromoCode.countDocuments({title: promoCode})
            if(p > total)
                total = p;
        }        
        if(depositAmountCredited){
            finalFilter.depositAmountCredited = parseFloat(depositAmountCredited);
            const dac = await History.countDocuments({depositAmountCredited})
            if(dac > total)
                total = dac;
        }

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if(!userName && !userEmail && !depositedAmount && !promoCode && !depositAmountCredited)
            total = await WireRequest.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)


        const wireRequests = await WireRequest.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'histories',
                    foreignField: '_id',
                    localField: 'historyId',
                    as: 'history'
                }
            },
            { $unwind: { path: "$history", preserveNullAndEmptyArrays: true } },
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
                    from: 'promocodes',
                    foreignField: '_id',
                    localField: 'promoCodeId',
                    as: 'promo'
                }
            },
            { $unwind: { path: "$promo", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    _id: 1,
                    image: 1,
                    localImage: 1,
                    depositedAmount: '$history.depositAmountSent',
                    depositAmountCredited: '$history.depositAmountCredited',
                    userName: '$user.firstName',
                    userEmail: '$user.email',
                    promoCode: '$promo.title',
                    status: 1
                }
            },
            {
                $match: {...finalFilter}
            },
            { $skip: limit * (page - 1) },
            { $limit: limit }
        ])

        return res.send({
            success: true, message: 'Wire Requests fetched successfully',
            data: {
                wireRequests,
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

exports.getWireRequest = async (req, res, next) => {
    try {
        let { requestId } = req.params;
        let filter = { _id: ObjectId(requestId) }

        const request = await WireRequest.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'histories',
                    foreignField: '_id',
                    localField: 'historyId',
                    as: 'history'
                }
            },
            { $unwind: { path: "$history", preserveNullAndEmptyArrays: true } },
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
                $project: {
                    _id: 1,
                    image: 1,
                    localImage: 1,
                    depositedAmount: '$history.depositAmountSent',
                    userName: '$user.firstName',
                    userEmail: '$user.email',
                    status: 1
                }
            }
        ])
        return res.send({ success: true, message: "Request Retrieved Successfully.", request: request[0] });

    } catch (error) {
        return next(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        let payload = req.body;
        let request = await WireRequest.findOne({ _id: ObjectId(payload.requestId) })

        // transfer tokens if receipt approved
        if (parseInt(payload.status) === 2) {
            let historyData = await History.findOne({ _id: ObjectId(request.historyId) })
            let userWalletData = await Tokenswallets.findOne({ userId: ObjectId(request.userId) })

            console.log(userWalletData, "userWalletData😙")

            let tokenData = await Wallet.findOne({ name: "TRI" })
            let amountPaid = historyData.depositAmountSent
            let walletAddress = userWalletData.ethereum
            let tokenAddress = tokenData.walletAddress

            // If PromoCode were used 
            if (request.promoCodeId) {
                let fetchedPromo = await PromoCode.findOne({ _id: ObjectId(request.promoCodeId) })

                await PromoCode.findByIdAndUpdate({ _id: request.promoCodeId }, { $inc: { NoOfTimesCodeAvailable: -1 } })
                let usedPromo = await UsedPromoCode.findOne({ userId: ObjectId(historyData.receiverId), promoCodeId: ObjectId(request.promoCodeId) })
                if (usedPromo) {
                    await UsedPromoCode.findByIdAndUpdate({ _id: usedPromo._id }, { $inc: { noOfTimesUsed: 1 } });
                }
                else {
                    await UsedPromoCode.create({ userId: historyData.receiverId, promoCodeId:request.promoCodeId , noOfTimesUsed: 1 })
                }
                await History.create({
                    receiverId: historyData.receiverId,
                    // referralCurrency: tokenAddress,
                    // bonusType: 1,
                    // depositAmountCredited: fetchedPromo.bonus,
                    historyType: 5,
                    promoCodeId: request.promoCodeId,
                })
                amountPaid = parseFloat(amountPaid) + parseFloat(fetchedPromo.bonus)
            }

            // If referred by another user and user's first request. 
            let wireRequestCount = await WireRequest.find({userId: ObjectId(request.userId), status:2})
            if(request.referralId && !wireRequestCount.length) {
                let referralTokenAddress = await Tokenswallets.findOne({userId: request.referralId})
                await transferToken(referralTokenAddress?.ethereum, tokenAddress, request.referrerPercent)
                await User.findByIdAndUpdate({ _id: request.referralId }, { $inc: { referralBonus: request.referrerPercent } })
                await History.create({
                    senderId: request.userId,
                    receiverId: request.referralId,
                    historyType: 4,
                    amountSent: request.$increferrerPercent,
                    referralCurrency: 'TRI'
                })
                amountPaid = amountPaid - request.referrerPercent
            }
            await transferToken(walletAddress, tokenAddress, amountPaid)
            await History.findByIdAndUpdate({_id: ObjectId(request.historyId)}, {$set: {depositAmountCredited:amountPaid}});
        }
        await WireRequest.updateOne({ _id: ObjectId(payload.requestId) }, { $set: payload }, { upsert: true });
        if(parseInt(payload.status) === 1) {
            await History.findByIdAndUpdate({_id: ObjectId(request.historyId)}, {$set: {depositAmountCredited: 0 }});
        }
        return res.send({ success: true, message: "Wire Request Processed successfully." });
    } catch (error) {
        return next(error);
    }
};

exports.fetchWithdrawRequestList = async (req, res, next) => {
    try {
        let { page, limit, userName, userEmail, withdrawalAmount, userStatus, status } = req.body
        let total = 0;
        const filter = {}
        const finalFilter = {}
        if(status){
            filter.status = parseInt(status);
        }
        if(userName){
            finalFilter.userName = userName;
            const n = await User.countDocuments({firstName: userName})
            if(n > total)
                total = n;
        }
        if(userEmail){
            finalFilter.userEmail = userEmail;
            const e = await User.countDocuments({email: userEmail})
            if(e > total)
                total = e;
        }
        if(withdrawalAmount)
            filter.withdrawalAmount = parseFloat(withdrawalAmount);    
        if(userStatus)
            filter.userStatus = parseInt(userStatus);


        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if(!userName && !userEmail)
            total = await witdrawRequest.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)


        const witdrawRequests = await witdrawRequest.aggregate([
            { $match: filter },
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
                    from: 'addressbooks',
                    foreignField: 'userId',
                    localField: 'userId',
                    as: 'userAddressBook'
                }
            },
            { $unwind: { path: "$userAddressBook", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    _id: 1,
                    withdrawalAmount: 1,
                    userName: '$user.firstName',
                    userId:1,
                    status: 1,
                    userStatus:1,
                    amountDeducted:1,
                    userEmail: '$user.email',
                    userAddressBook: 1,
                    withdrwalMethod:1
                }
            },
            {
                $match: {...finalFilter}
            },
            { $skip: limit * (page - 1) },
            { $limit: limit }
        ])

        return res.send({
            success: true, message: 'Witdraw Requests fetched successfully',
            data: {
                witdrawRequests,
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
exports.uploadWithdrawReceipt = async (req, res, next) => {
    try {
        let payload = req.body;
        let receipt = req.file;
        let userBalance;
        if (receipt) {
            payload.image = await uploadToCloudinary(receipt.path)
            payload.localImage = receipt.filename
        }

        // Check User Balance
        let User = await witdrawRequest.findOne({ _id: ObjectId(payload.withdrawalId) })
        let userWalletData = await Tokenswallets.findOne({ userId: ObjectId(User.userId) })
        let tokenData = await Wallet.findOne({ name: "TRI" })
        if (userWalletData && tokenData) {
            userBalance = await getBalanceOfToken(tokenData.networkId, tokenData.walletAddress, userWalletData.ethereum)
        }
        else {
            return res.status(400).send({ message: "Wallet and User Data Required" })
        }

        // Success Case - If user has tokens
        if (userBalance > User.withdrawalAmount) {
            payload.status = 2
            payload.userStatus = 0
            await witdrawRequest.findByIdAndUpdate({ _id: payload.withdrawalId }, { $set: payload });
        }
        // Failure Case
        else {
            return res.status(400).send({ message: "User do not have enough tokens" })
        }


        return res.send({ success: true, message: "Receipt Uploaded Successfully." })

    } catch (error) {
        return next(error)
    }
}

exports.deductTRI = async (req, res, next) => {
    try {
        let {userId,amount,withdrawalId,withdrwalMethod} = req.query;
        let userWalletData = await Tokenswallets.findOne({ userId: ObjectId(userId) })
        let tokenData = await Wallet.findOne({ name: "TRI" })


        // Send Amount to Admin
        const transactionRes = await sendAmountToAdmin(tokenData.walletAddress, erc20Abi, amount, userWalletData.ethereum, userWalletData.ethereumPrivateKey, chainsConfigs[tokenData.networkId].ownerAddress, tokenData.networkId)
        if (transactionRes.status) {
            if(parseInt(withdrwalMethod) === 2) {
                // Update profit stats
                let {availableProfit} = await Stats.findOne({userId: ObjectId(userId)})
                let remainingAmount = availableProfit - amount
                await Stats.findOneAndUpdate({userId: ObjectId(userId)}, {availableProfit: remainingAmount})
           }
            await witdrawRequest.findByIdAndUpdate({ _id: withdrawalId }, { amountDeducted: true});
            return res.send({ success: true, message: 'Amount Deducted from User Wallet.' })
        } 
        else {
            return res.send({ success: false, message: 'Something went wrong' })
        }
        

       

    } catch (error) {
        return next(error)
    }
}





