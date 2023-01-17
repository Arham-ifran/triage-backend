const mongoose = require('mongoose');

/**
 * Rewards Schema
 * @private
 */
const RewardsSchema = new mongoose.Schema({
    rewardId:{type:Number, default:0, required:true,unique: true},
    rewardName:{type:String},
    rewardDescription:{type:String},
    type:{type:String},
    image:{type:String},
    price:{type:Number}
}, { timestamps: true }
);

/**
 * @typedef Rewards
 */

 RewardsSchema.pre('save', async function save(next) {
    try {
      let reward = await mongoose.model('Rewards', RewardsSchema).findOne().limit(1).sort({$natural:-1})
      const rewardId= reward ? reward.rewardId : 0;
      this.rewardId = rewardId+1;
      return next();
    }
    catch (error) {
      return next(error);
    }
  });


  RewardsSchema.methods.transform = async function(){
    const transformed = {};
    const fields = ['_id', 'rewardId', 'rewardName', 'rewardDescription', 'image', 'price'];
    for(let i=0;i<fields.length;i++){
     transformed[fields[i]] = this[fields[i]];
    }
    let num= this.rewardId;
    const numZeroes = 8 - num.toString().length + 1;
    if (numZeroes > 0) {
      num= Array(+numZeroes).join("0") + num;
    }
    transformed.rewardId=num;
    return transformed;
}

module.exports = mongoose.model('Rewards', RewardsSchema);