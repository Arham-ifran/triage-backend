const History = require('../../models/history.model');
const ObjectId = require('mongoose').Types.ObjectId

// API to get support list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, historyType, senderAdd, receiverAdd } = req.query
        const filter = {}
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (historyType) {
            filter.historyType = parseInt(historyType)
        }
        else {
            filter.historyType = 1
        }

        if(senderAdd){
            filter.senderAddress = senderAdd
        }

        if(receiverAdd){
            filter.receiverAddress = receiverAdd
        }

        const total = await History.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const history = await History.aggregate([
            { $match: filter },
            // {
            //     $lookup: {
            //         from: 'tokenswallets',
            //         foreignField: 'userId',
            //         localField: 'senderId',
            //         as: 'sender'
            //     }
            // },
            // { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } },
            // {
            //     $lookup: {
            //         from: 'tokenswallets',
            //         foreignField: 'userId',
            //         localField: 'receiverId',
            //         as: 'receiver'
            //     }
            // },
            // { $unwind: { path: "$receiver", preserveNullAndEmptyArrays: true } },
            { $sort: { updatedAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    senderAdd: '$senderAddress', receiverAdd: '$receiverAddress',
                    amountSent: 1, currency: 1, gasFee: 1, txHash: 1, referralCurrency: 1,
                    email: 1, bonusType: 1, lockedCurrency: 1, savingsCurrency: 1, savingType: 1,
                    updatedAt: 1
                }
            }
        ])

        return res.send({
            success: true, message: 'History Data Fetched Successfully',
            data: {
                history,
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
