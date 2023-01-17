const Wallet = require("../../models/wallets.model")
const { checkDuplicate } = require('../../../config/errors')
const { uploadToCloudinary } = require('../../utils/upload')

// API to create Wallet
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        console.log(payload)
        if (req.files && req.files.image) {
            const image = req.files.image[0]
            payload.logo = await uploadToCloudinary(image.path)
        }
        const wallet = await Wallet.create(payload)
        return res.send({ success: true, message: 'Wallet created successfully', wallet })
    } catch (error) {
        console.log(error)
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Wallet')
        else
            return next(error)
    }
}

// API to edit Wallet
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        if (req.files && req.files.image) {
            const image = req.files.image[0]
            payload.logo = await uploadToCloudinary(image.path)
        }
        const wallet = await Wallet.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Wallet updated successfully', wallet })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Wallet')
        else
            return next(error)
    }
}

// API to delete Wallet
exports.delete = async (req, res, next) => {
    try {
        const { walletId } = req.params
        if (walletId) {
            const wallet = await Wallet.deleteOne({ _id: walletId })
            if (wallet && wallet.deletedCount)
                return res.send({ success: true, message: 'Wallet deleted successfully', walletId })
            else return res.status(400).send({ success: false, message: 'Wallet not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Wallet Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a Wallet
exports.get = async (req, res, next) => {
    try {
        const { walletId } = req.params
        if (walletId) {
            const wallet = await Wallet.findOne({ _id: walletId }, { _id: 1, walletAddress: 1, status: 1, name: 1, symbol: 1, networkId: 1, type: 1, interestRate: 1 }).lean(true)
            if (wallet)
                return res.json({ success: true, message: 'Wallet retrieved successfully', wallet })
            else return res.status(400).send({ success: false, message: 'Wallet not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Wallet Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get Wallet list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, status, name } = req.query
        const filter = {}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if (status !== undefined) {
            if (status === 'true') {
                filter.status = true
            }
            else {
                filter.status = false
            }
        }

        if (name !== undefined) {
            filter.name = { $regex: name, $options: 'i' }
        }

        const total = await Wallet.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        console.log("filter = ", filter)

        const wallets = await Wallet.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, walletAddress: 1, status: 1, name: 1, logo: 1, symbol: 1, networkId: 1, type: 1, interestRate: 1
                }
            }
        ])

        return res.send({
            success: true, message: 'Wallets fetched successfully',
            data: {
                wallets,
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
