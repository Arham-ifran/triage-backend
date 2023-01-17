const express = require('express');
const controller = require('../../../controllers/front/kyc.controller');
const router = express.Router();
const { kycPersonalDoc } = require('../../../utils/upload')

router.route('/update').put(kycPersonalDoc, controller.update);
router.route('/get/:userId').get(controller.get);

module.exports = router;