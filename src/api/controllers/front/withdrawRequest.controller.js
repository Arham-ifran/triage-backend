const ObjectId = require('mongoose').Types.ObjectId
const History = require('../../models/history.model')
const { uploadToCloudinary } = require('../../utils/upload');
const witdrawRequest = require("../../models/withdrawalrequest.model")

exports.addWithdrawRequest = async (req, res, next) => {
    try {
        let payload = req.body
         await witdrawRequest.create({
            withdrawalAmount: payload.withdrawalAmount,
            userId: payload.userId,
            withdrwalMethod: payload.withdrwalMethod
            
        })
        await History.create({
            senderId: payload.userId,
            amountSent: payload.withdrawalAmount,
            historyType: 2
        })
        return res.send({ success: true, message: 'Request Added successfully' })
    } catch (error) {
        return next(error)
    }
}

exports.updatewithdrawRequestStatus = async(req, res, next) => {
    try{

        let {_id, status} = req.body;
        await witdrawRequest.findByIdAndUpdate({_id: ObjectId(_id)}, {userStatus:status})
        res.status(200).send({success: true, message: "Withdraw Request Status Updated Successfully", status})
    }
    catch(error) {
        return next(error)
    }
}
