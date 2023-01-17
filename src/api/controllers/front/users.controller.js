const ObjectId = require('mongoose').Types.ObjectId
const User = require('../../models/users.model');
const KYC = require("../../models/kyc.model")
const History = require("../../models/history.model");
const { uploadToCloudinary } = require('../../utils/upload');
const Wallet = require("../../models/wallets.model")


exports.update = async (req, res, next) => {
  try {
    let payload = req.body;
    let { userId } = req.params
    if (req.files) {
      for (const key in req.files) {
        const image = req.files[key][0]
        payload[key] = await uploadToCloudinary(image.path)
        payload[`${key}Local`] = image.filename
      }
    }

    let user = await User.findByIdAndUpdate({ _id: userId }, { $set: payload }, { new: true });
    let data = user.transform();
    return res.send({ success: true, data, message: "Your profile is updated successfully." });
  } catch (error) {
    return next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    let { userId } = req.params;
    let user = await User.findOne({ _id: ObjectId(userId) });
    let kyc = await KYC.findOne({userId: ObjectId(userId)}, {appliedKYC:1, _id: 0})
    let walletData = await Wallet.findOne({ name: "TRI" })
    user = user.transform();
    return res.send({ success: true, data: user, message: "Users fetched succesfully", kycStatus: kyc ? kyc.appliedKYC : '', walletData });
  } catch (error) {
    return next(error);
  }
};


exports.uploadContent = async (req, res, next) => {
  try {
    const files = req.file ? `${req.file.filename}` : "";
    return res.json({ success: true, message: 'File upload successfully', data: files })
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
};

exports.getUserReferrals = async (req, res, next) => {
  try {
    let { userId } = req.params;
    let userReferrals = await User.find({ refferedBy: ObjectId(userId) });
    const userReferralBonus = await User.find({ _id: ObjectId(userId) });
    return res.send({ success: true, userReferrals, referralBonus: userReferralBonus[0].referralBonus, message: "User Referrals Retrieved Successfully." });
     } catch (error) {
    return next(error);
  }
};

exports.userHistory = async (req, res, next) => {
  try {
    let { userId } = req.params;
    let userHistory = await History.findOne({ userId: ObjectId(userId) });
    return res.send({ success: true, data: userHistory, message: "User History fetched succesfully" });
  } catch (error) {
    return next(error);
  }
};

exports.getTokenStats = async (req, res, next) => {
  try{
    const { symbol } = req.params
    

  } catch (error) {
    return next(error);
  }
} 