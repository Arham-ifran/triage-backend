const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/staking.controller')

router.route('/list').get(controller.list)
router.route('/rec-staking-list').get(controller.recList)
router.route('/sendInterest').post(controller.sendStakedInterest)
router.route('/transferAmount').post(controller.getAmountToAdmin)

module.exports = router