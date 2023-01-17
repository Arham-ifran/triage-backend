const router = require('express').Router();
const controller = require('../../../controllers/admin/request.controller');

router.route('/get').get(controller.get);
router.route('/manage').post(controller.manage);

module.exports = router;