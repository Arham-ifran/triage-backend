const ObjectId = require('mongoose').Types.ObjectId
const Kyc = require('../../models/kyc.model');
const { uploadToCloudinary } = require('../../utils/upload');

exports.get = async (req, res, next) => {
  try {
    let { userId } = req.params;
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

    if (payload.kycStatus === 'true')
      payload.kycStatus = true
    else
      payload.kycStatus = false

    await Kyc.updateOne({ userId: ObjectId(payload.userId) }, { $set: payload }, { upsert: true, new: true });

    return res.send({ success: true, message: "KYC Approved successfully." });
  } catch (error) {
    return next(error);
  }
};


exports.kycList = async (req, res, next) => {
  try {
    let { all, page, limit, firstName, lastName, startDate, endDate } = req.query
    const filter = {
      //appliedKYC: 1
    }
    filter["$or"] = [{ appliedKYC: 2 }, { appliedKYC: 3 }];

    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      if (startDate.getTime() == endDate.getTime()) {
        filter.createdAt = { $gte: startDate };
      } else {
        filter["$and"] = [
          { createdAt: { $gte: startDate } },
          { createdAt: { $lte: endDate } },
        ];
      }
    }
    if (firstName) filter.firstName = { $regex: firstName, $options: "gi" };

    if (lastName) filter.lastName = { $regex: lastName, $options: "gi" };

      page = page !== undefined && page !== '' ? parseInt(page) : 1
      limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10
      

      const total = await Kyc.countDocuments(filter)

      if (page > Math.ceil(total / limit) && total > 0)
          page = Math.ceil(total / limit)


      const kycs = await Kyc.aggregate([
          { $match: filter },
          {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'userId',
                as: 'user'
            }
        },
        {
            $unwind: {
                path: "$user", preserveNullAndEmptyArrays: true
            }
        },
          { $sort: { updatedAt: -1 } },
          { $skip: limit * (page - 1) },
          { $limit: limit },
          {
              $project: {
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  dob:1, 
                  userId: 1, 
                  personalDocumentPassportFront: 1,
                  personalDocumentPassportBack: 1,              
                  personalDocumentIDCardFront: 1,
                  personalDocumentIDCardBack: 1,
                  personalDocumentDrivingIDFront: 1,
                  personalDocumentDrivingIDBack: 1,
                  phone: 1,
                  country: 1,
                  countryCode: 1,
                  email: "$user.email",
                  addressDocument: 1,
                  additionalDocument: 1,              
                  kycStatus: 1,
                  appliedKYC: 1,
                  createdAt:1,
                  updatedAt:1
                  
              }
          }
      ])

      return res.send({
          success: true, message: 'KYC Requests fetched successfully',
          data: {
            kycs,
              pagination: {
                  page, limit, total,
                  pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
              }
          }
      })
  } catch (error) {
      return next(error)
  }
}



