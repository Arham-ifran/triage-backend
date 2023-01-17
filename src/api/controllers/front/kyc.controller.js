const ObjectId = require('mongoose').Types.ObjectId
const Kyc = require('../../models/kyc.model');
const { uploadToCloudinary } = require('../../utils/upload');
 
exports.get = async (req, res, next) => {
  try {
    let { userId } = req.params;
    console.log(userId, "USER ID ID ID")
    if (userId) {
      let kyc = await Kyc.findOne({ userId: ObjectId(userId) }).lean(true);
      return res.send({ success: true, message: "KYC Retrieved Successfully.", kyc });
    }
    return res.send({ success: false, message: "User Id Is Required" });
  } catch (error) {
    return next(error);
  }
}

exports.update = async (req, res, next) => {
  try {
    let payload = req.body;

    if (req.files) {
      for (const key in req.files) {
        const image = req.files[key][0]
        payload[key] = await uploadToCloudinary(image.path)
        payload[`${key}Local`] = image.filename
      }
    }

    await Kyc.updateOne({ userId: ObjectId(payload.userId) }, { $set: payload }, { upsert: true, new: true });

    return res.send({ success: true, message: "KYC updated successfully." });
  } catch (error) {
    return next(error);
  }
};

