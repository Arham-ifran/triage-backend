const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/settings.controller')
const { cpUpload } = require('../../../utils/upload')

router.route('/edit').put(cpUpload, controller.edit)
router.route('/get').get(controller.get)
router.route('/editbankdetails').post(controller.updateBankDetails)
router.route('/getbankdetails').get(controller.getBankDetails)


module.exports = router