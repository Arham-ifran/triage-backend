const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/request.controller')

router.route('/create').post(controller.create)

module.exports = router