const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/criteria.controller')
const { cpUpload } = require('../../../utils/upload')

router.route('/create').post(cpUpload, controller.create)
router.route('/edit').put(cpUpload, controller.edit)
router.route('/delete/:id').delete(controller.delete)
router.route('/list').get(controller.list)
router.route('/get/:id').get(controller.get)
router.route('/list-account-tiers').get(controller.listAccountTiers)


module.exports = router