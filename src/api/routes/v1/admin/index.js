const express = require('express')
const userRoutes = require('./users.route')
const adminRoutes = require('./admin.route')
const roleRoutes = require('./roles.route')
const emailRoutes = require('./email.route')
const settingsRoutes = require('./settings.route')
const faqRoutes = require('./faq.route')
const contactRoutes = require('./contact.route')
const cmsRoutes = require('./cms.route')
const activityRoutes = require('./activity.route')
const walletRoutes = require('./wallet.route')
const accountTiersRoutes = require('./accountTiers.route')
const kycRoutes = require('./kyc.route')
const newsletterRoutes = require('./newsletter.route')
const promoCodesRoutes = require('./promoCode.route')
const faqCategoriesRoutes = require('./faqCategories.route')
const criteriaRoutes = require('./criteria.route')
const stakingRoutes = require('./staking.route')
const historyRoutes = require('./history.route.js')
const requestRoutes = require('./request.route')
const wireRequestRoutes = require('./wirerequest.route')


const router = express.Router()

/**
 * GET v1/admin
 */
router.use('/staff', adminRoutes)
router.use('/role', roleRoutes)
router.use('/user', userRoutes)
router.use('/email', emailRoutes)
router.use('/settings', settingsRoutes)
router.use('/faq', faqRoutes)
router.use('/wallet', walletRoutes)
router.use('/contacts', contactRoutes)
router.use('/content', cmsRoutes)
router.use('/activity', activityRoutes)
router.use('/account-tiers', accountTiersRoutes)
router.use('/kyc', kycRoutes)
router.use('/newsletter', newsletterRoutes)
router.use('/promocode', promoCodesRoutes)
router.use('/faq-categories', faqCategoriesRoutes)
router.use('/criteria', criteriaRoutes)
router.use('/staking', stakingRoutes)
router.use('/history', historyRoutes)
router.use('/request', requestRoutes)
router.use('/wirerequests', wireRequestRoutes)



module.exports = router
