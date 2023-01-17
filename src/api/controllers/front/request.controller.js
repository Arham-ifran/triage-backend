const Request = require('../../models/request.model')
const { checkDuplicate } = require('../../../config/errors')

// API to create Security
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        const userId = req.user
        payload["userId"] = userId
        const isExist = await Request.findOne({ userId: userId, type: payload.type })
        
        let request = null
        if(isExist){
            return res.send({ success: true, message: 'You already have requested for account deletion.', request })
        }else {
            request = await Request.create(payload)
        }
        return res.send({ success: true, message: 'Your request to delete account have been recieved. It will be deleted as soon the request gets processed', request })
    } catch (error) {u
        console.log(error)
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Request')
        else
            return next(error)
    }
}