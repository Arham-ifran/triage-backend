const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/stake.controller')

router.route('/create').post(controller.create)
router.route('/getAmount').get(controller.getStakeAmount)
router.route('/send-profit-cron').get(controller.sendProfitCron)
router.route('/fetch-profit').get(controller.fetchUserProfit)

module.exports = router