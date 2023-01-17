const ObjectId = require('mongoose').Types.ObjectId;
// const { checkDuplicate } = require('../middlewares/error');
const Request = require('../../models/request.model');
const User = require('../../models/users.model')

// API to list all request
exports.get = async (req, res, next) => {
    try {
        let { page, limit, status, firstName, lastName} = req.query

        let filter = {}
        let filter1 = {} 

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10


        if (status){
            filter.status = status  
        }

        if (firstName){
            filter1['firstName'] = { $regex: firstName, $options: "gi" }
        }

        if (lastName){
            filter1['lastName'] = { $regex: lastName, $options: "gi" }
        }

        const total = await Request.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

            const requests = await Request.aggregate([
            { $match: {...filter} },
            { 
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'userId',
                    as: 'user'
                }
            },
            {$unwind: {path: "$user", preserveNullAndEmptyArrays: true}},
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, type: 1, status: 1, description: 1, firstName: '$user.firstName', lastName: '$user.lastName',
                    email: '$user.email'
                }
            },
            { $match: {...filter1} },
        ])

        return res.send({
            success: true, message: 'Requests fetched successfully',
            data: {
                requests,
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

// Api to manage request
exports.manage = async (req, res, next) => {
    try{
        console.log("req. body = ", req.body)
        let { action, _id } = req.body
        console.log("action ⭐", action)

        // 1- accepted, 2- rejected
        if(action == 1){
            let request = await Request.findById({_id: _id})
            if(request.type == 1 ){
                await User.findByIdAndDelete({_id: request.userId})
                await Request.findByIdAndDelete({_id: _id})
            }
            return res.send({ success: true, message: 'Request Accepted Successfully', })         
        }
        if(action == 2){
            const request = await Request.findByIdAndUpdate({_id: _id}, {status: 3})
            return res.send({ success: true, message: 'Request Rejected Successfully', request})
        }else {
            return res.send({ success: false, message: 'Action should be rejected/accepted.',})
        }
    }catch (error) {
        return next(error)
    }
}