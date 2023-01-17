const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/settings.controller')

router.route('/get').get(controller.get)
router.route('/getbankdetails').get(controller.getBankDetails)


module.exports = router