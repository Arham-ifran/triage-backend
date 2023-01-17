const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/addressBook.controller')

router.route('/create').post(controller.create)
router.route('/edit').put(controller.edit)
router.route('/delete/:Id').delete(controller.delete)
router.route('/get/:Id').get(controller.get)
router.route('/list').get(controller.list)

module.exports = router