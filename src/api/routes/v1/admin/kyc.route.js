const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/kyc.controller')
const { cpUpload } = require('../../../utils/upload')

router.route('/get/:userId').get(controller.get) 
router.route('/update').put(cpUpload, controller.update)
router.route('/getkycs').get( controller.kycList)

module.exports = router