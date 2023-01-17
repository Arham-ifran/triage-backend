const History = require('../../models/history.model');
const ObjectId = require('mongoose').Types.ObjectId
const witdrawRequest = require("../../models/withdrawalrequest.model")

// API to get support list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, historyType, receiverId, receiverAddress, senderAddress, dashboardLimit } = req.query


        console.log(historyType, "historyTypehistoryTypehistoryTypehistoryType 🛍")


        const filter = {}
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (historyType) {
            filter.historyType = parseInt(historyType)
        }
        else {
            filter.historyType = 1
        }

        // if (senderAddress && parseInt(historyType) === 2)
        //     filter.senderAddress = senderAddress

        // if (receiverAddress && parseInt(historyType) === 3)
        //     filter.receiverAddress = receiverAddress

        // if (receiverId && (parseInt(historyType) !== 2) && parseInt(historyType) !== 3) {
            filter.receiverId = ObjectId(receiverId)
        // }

        const total = await History.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        let history;
        history = await History.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'tokenswallets',
                    foreignField: 'userId',
                    localField: 'senderId',
                    as: 'sender'
                }
            },
            { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'tokenswallets',
                    foreignField: 'userId',
                    localField: 'receiverId',
                    as: 'receiver'
                }
            },
            { $unwind: { path: "$receiver", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'wallets',
                    foreignField: 'walletAddress',
                    localField: 'referralCurrency',
                    as: 'wallet'
                }
            },
            { $unwind: { path: "$wallet", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'criterias',
                    foreignField: '_id',
                    localField: 'savingsCurrency',
                    as: 'criteria'
                }
            },
            { $unwind: { path: "$criteria", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'promocodes',
                    foreignField: '_id',
                    localField: 'promoCodeId',
                    as: 'promo'
                }
            },
            { $unwind: { path: "$promo", preserveNullAndEmptyArrays: true } },
            { $sort: { updatedAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: dashboardLimit ? parseInt(dashboardLimit) : limit },
            {
                $project: {
                    senderAdd: '$sender.ethereum', receiverAdd: '$receiver.ethereum',
                    amountSent: 1, gasFee: 1, txHash: 1, referralCurrency: '$wallet.name',
                    email: 1, bonusType: 1, lockedCurrency: 1, savingsCurrency: 1, savingType: 1, profitType: 1,
                    updatedAt: 1, depositAmountSent: 1, depositAmountCredited: 1, savingsCurrency: '$criteria.currency', senderAddress: 1,
                    receiverAddress: 1,receiptUploaded:1, depositType: 1,
                    promoCode: '$promo.title',
                    promoCodeType: '$promo.codeType',
                    promoCodeBonus: '$promo.bonus',
                }
            }
        ])
        if (parseInt(historyType) === 2) {
            history = await witdrawRequest.find({ userId: receiverId })
        }
        return res.send({
            success: true, message: 'History Data Fetched Successfully',
            data: {
                history,
                filter,
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

exports.insertHistory = async (req, res, next) => {
    console.log("hello mr bean = ⭐", req.body)
    try {
        let payload = req.body
        console.log("history payload = ", payload)
        const history = await History.create(payload)
        return res.send({ success: true, message: 'History Updated Successfully.', history })
    } catch (error) {
        console.log(error)
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'History')
        else
            return next(error)
    }
}

