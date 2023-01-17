const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/wallet.controller')

router.route('/get/:walletId').get(controller.get)
router.route('/list').post(controller.list)
router.route('/symbol/list').get(controller.symbolList)

module.exports = router