const express = require('express');
const controller = require('../../../controllers/admin/history.controller.js');
const router = express.Router();

router.route('/list').get(controller.list)

module.exports = router;