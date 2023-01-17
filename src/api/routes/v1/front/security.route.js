const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/security.controller')

router.route('/create').post(controller.create)
router.route('/get').get(controller.get)

module.exports = router