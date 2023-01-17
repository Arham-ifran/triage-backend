const express = require('express')
const router = express.Router()
const { uploadSingle } = require('../../../utils/upload')
const controller = require('../../../controllers/front/wirerequest.controller')

router.route('/create').post(controller.createRequest)
router.route('/delete/:requestId').delete(controller.delete)
router.route("/depositreceipt").post(uploadSingle,controller.uploadReceipt)
router.route("/list").get(controller.fetchWireRequests)


module.exports = router