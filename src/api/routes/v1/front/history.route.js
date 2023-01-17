const express = require('express');
const controller = require('../../../controllers/front/history.controller');
const router = express.Router();

router.route('/create').post(controller.insertHistory)
router.route('/list').get(controller.list)

module.exports = router;