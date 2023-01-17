const express = require('express');
const controller = require('../../../controllers/front/auth.controller');
const { profileUpload } = require('../../../utils/upload')
const router = express.Router();


router.route('/get-qr').get(controller.getQrCodeUrl)
router.route('/check-verification').get(controller.getVerified)
router.route('/register').post(controller.register);
router.route('/login').post(controller.login);
router.route('/forgot-password').post(controller.forgotPassword)
router.route('/reset-password').post(controller.resetPassword)
router.route('/change-password').put(controller.changePassword)
router.route('/edit-profile').put(controller.editProfile)
router.route('/update-banner').put(profileUpload, controller.updateBanner);
router.route('/getEnabledSecurity').post(controller.checkEnabledSecurity)

module.exports = router;