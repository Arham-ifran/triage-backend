const express = require('express');
const controller = require('../../../controllers/front/users.controller');
const router = express.Router();
const { profileUpload, uploadSingle } = require('../../../utils/upload')

router.route('/:userId').put(profileUpload, controller.update);
router.route('/:userId').get(controller.getUser);
router.route('/upload-image').post(uploadSingle, controller.uploadContent);
router.route('/refferals/:userId').get(controller.getUserReferrals);
router.route('/history/:_id').get(controller.userHistory);
// router.route('/stats/:symbol').get(controller)

module.exports = router;