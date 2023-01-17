const ObjectId = require('mongoose').Types.ObjectId
const History = require('../../models/history.model')
const User = require('../../models/users.model')
const PromoCode = require('../../models/promoCode.model')
const { uploadToCloudinary } = require('../../utils/upload');
const WireRequest = require("../../models/wirerequest.model")



exports.createRequest = async (req, res, next) => {
    try {
        let payload = req.body
        const data = await History.create({
            depositAmountSent: payload.amountPaid,
            depositAmountCredited: 0,
            promoCodeId: payload.promoCodeId,
            referralId: payload.referralId,
            referrerPercent: payload.referrerPercent,
            historyType: 1,
            receiverId: payload.userId,
            depositType: 1
        })

        return res.send({ success: true, message: 'Request sent successfully', data })
    } catch (error) {
        return next(error)
    }
}

exports.delete = async (req, res, next) => {
    try {
        const { requestId } = req.params
        if (requestId) {
            await History.deleteOne({ _id: requestId })
            return res.send({ success: true })
        } else
            return res.status(400).send({ success: false, message: 'requestId is required' })
    } catch (error) {
        return next(error)
    }
}

exports.uploadReceipt = async (req, res, next) => {
    try {

        let payload = req.body;
        let history = await History.findOne({_id: payload.historyId})
        if(history.promoCodeId) {
            let promoCodeId = await PromoCode.findOne({_id: history.promoCodeId})
            payload.promoCodeId = promoCodeId
        }
        if(history.referralId) {
            payload.referralId = history.referralId
            payload.referrerPercent = history.referrerPercent
        }
        let receipt = req.file;
        if (receipt) {
            payload.image = await uploadToCloudinary(receipt.path)
            payload.localImage = receipt.filename
        }
        await WireRequest.create(payload);
        await History.findByIdAndUpdate({_id: ObjectId(payload.historyId)}, {receiptUploaded: payload.receiptUploaded})
        return res.send({ success: true, message: "Wire Request Created Successfully." })

    } catch (error) {
        return next(error)
    }
}

exports.fetchWireRequests = async (req, res, next) => {
    try {
        let { page, limit, status, name } = req.query
        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10


        const total = await WireRequest.countDocuments(filter)

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
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    image: 1,
                    localImage: 1,
                    depositedAmount: '$history.depositAmountSent',
                    userName: '$user.firstName',
                    userEmail: '$user.email'
                }
            }
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