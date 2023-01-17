const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/wirerequest.controller')
const { uploadSingle } = require('../../../utils/upload')


router.route("/list").post(controller.fetchWireRequests)
router.route('/get/:requestId').get(controller.getWireRequest) 
router.route('/update').post(controller.update) 
router.route("/withdrawlist").post(controller.fetchWithdrawRequestList)
router.route("/upload-withdraw-receipt").post(uploadSingle,controller.uploadWithdrawReceipt)
router.route("/deduct-tri").post(controller.deductTRI)




module.exports = router