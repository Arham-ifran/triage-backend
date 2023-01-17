const mongoose = require('mongoose');

/**
 * Games Schema
 * @private
 */
const GamesSchema = new mongoose.Schema({
    gameId:{type:Number, default:0, required:true,unique: true},
    name: { type: String, default: '' },
    description: {type: String, default: '' },
    icon:  {type:String},
    platformType: { type: Number },      //(1 = android, 2 = ios, 3 = cross platform)
    developmentEnv:{ type: Number  },    //(1= unity, 2 = android studio, xcode =3,unity + android studio=4,unity + xcode = 5  ) 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orientation: { type: Number },       // (1= portrait, 2 = landscape)
    winningScore: { type: Number },      //(1 = Highest Score, 2 = Lowest Score)
    gameFormat: { type: Number },        //(1 = Play & Compare, 2 = Real Time),
    monitizationModel: { type: Number }, //(1 = Real Prize, 2 = Virtual Currency)
    downloaded:{type:Boolean},   //(true,false)
    inProgress:{type:Boolean},   //(true,false)
    launched:  {type:Boolean},   //(true,false)
    prizeEnabled :{type:Boolean},//(true,false)
    archived :{type:Boolean},    //(true,false)
    genre :{type:String}, 
    rank  :{type:Object} ,     //rank:"{"gameLevel":"123","rankId":"123","progressXp":"100"}"   
    instruction :{type:String}, 
}, { timestamps: true }
);
/**
 * @typedef Games
 */


 GamesSchema.pre('save', async function save(next) {
    try {
      let game = await mongoose.model('Games', GamesSchema).findOne().limit(1).sort({$natural:-1})
      const gameId= game ? game.gameId : 0;
      this.gameId = gameId+1;
      return next();
    }
    catch (error) {
      return next(error);
    }
  });

  GamesSchema.methods.transform = async function(){
    const transformed = {};
    const fields = ['_id', 'gameId', 'description', 'name', 'icon', 'platformType', 'developmentEnv', 'userId', 'monitizationModel' , 'gameFormat' , 'winningScore' , 'orientation','downloaded','inProgress','launched','prizeEnabled','archived'];
    for(let i=0;i<fields.length;i++){
     transformed[fields[i]] = this[fields[i]];
    }
    let num= this.gameId;
    const numZeroes = 8 - num.toString().length + 1;
    if (numZeroes > 0) {
      num= Array(+numZeroes).join("0") + num;
    }
    transformed.gameId=num;
    return transformed;
}


module.exports = mongoose.model('Games', GamesSchema);