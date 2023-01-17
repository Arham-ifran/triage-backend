const express = require('express')
const router = express.Router()
const { uploadSingle } = require('../../../utils/upload')
const controller = require('../../../controllers/front/withdrawRequest.controller')

router.route('/add').post(controller.addWithdrawRequest)
router.route('/updatestatus').post(controller.updatewithdrawRequestStatus)

module.exports = router