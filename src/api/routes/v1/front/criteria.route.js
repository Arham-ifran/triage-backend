const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/criteria.controller')

router.route('/clist').get(controller.criteriaList)
router.route('/list').get(controller.list)
router.route('/plans').get(controller.getPlans)
router.route('/plans-profit').get(controller.plansProfit)

module.exports = router