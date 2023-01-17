const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/currencyCap.controller')

router.route('/get').get(controller.get)
router.route('/listStats').get(controller.listStats)

module.exports = router