const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/accountLevel.controller')

router.route('/list-levels').get(controller.listLevels)
router.route('/account-levels-detail').get(controller.accountLevelsDetail)
router.route('/min-investment/:balance').get(controller.levelsMinInvestment)
module.exports = router

