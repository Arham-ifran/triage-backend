const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/promoCode.controller')


router.route('/get/:promoCode').get(controller.verifyPromoCode);
router.route('/list/:_id').get(controller.UsedPromosList);



module.exports = router