const fs = require('fs')
const PromoCode = require('../../models/promoCode.model')
const UserPromos = require("../../models/usedPromoCodes.model")
const ObjectId = require('mongoose').Types.ObjectId;


// API to verify a Promo Code
exports.verifyPromoCode = async (req, res, next) => {
    try {
        const { promoCode } = req.params;
        if (promoCode) {
            const promo = await PromoCode.findOne({ title: promoCode, status: true, NoOfTimesCodeAvailable: { $gt: 0 },})
            if (promo)
            {
                return res.json({ success: true, PromoMatch: "true", message: 'Valid Promo Code', promo })
            }
            else  { return res.json({ success: true, PromoMatch: "false", message: 'Invalid Promo Code', promo })}
          
        } else
            return res.status(400).send({ success: false, message: 'Promo Code Title not found' })
    } catch (error) {
        return next(error)
    }
}

exports.UsedPromosList = async (req, res, next) => {
    try {
        let { page, limit } = req.query
        let { _id } = req.params
        const filter = {
            userId: ObjectId(_id)
        }

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await PromoCode.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const usedpromoCodes = await UserPromos.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'users',
                    foreignField: 'userId',
                    localField: '_id',
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
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    'codeType': '$promo.codeType',
                    'bonus': '$promo.bonus',
                    'title': '$promo.title',
                    noOfTimesUsed: 1
                }
            }
        ])

        return res.send({
            success: true, message: 'Used Promo Codes fetched successfully',
            data: {
                usedpromoCodes,
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
