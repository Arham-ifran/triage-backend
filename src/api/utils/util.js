var fs = require('fs');
var path = require("path");
const EthereumQRPlugin = require('ethereum-qr-code')

exports.leadingZeros =async (data)=>{
    const transformed = {};
    const fields = ['_id', 'gameId', 'description', 'name', 'icon', 'platformType', 'developmentEnv', 'userId', 'monitizationModel' , 'gameFormat' , 'winningScore' , 'orientation','downloaded','inProgress','launched','prizeEnabled','archived','updatedAt','createdAt'];
    for(let i=0;i<fields.length;i++){
     transformed[fields[i]] = data[fields[i]];
    }
    let num= data['gameId'];
    const numZeroes = 8 - num.toString().length + 1;
    if (numZeroes > 0) {
      num= Array(+numZeroes).join("0") + num;
    }
    transformed.gameId=num;
    return transformed;
}


exports.leadingZerosMobile =async (data)=>{
  const transformed = {};
  const fields = [ 'gameID', 'gameName', 'gameImage', 'gamePlatform', 'gameGenre', 'gameInstructions','gameRank'];
  for(let i=0;i<fields.length;i++){
   transformed[fields[i]] = data[fields[i]];
  }
  let num= data['gameID'];
  const numZeroes = 8 - num.toString().length + 1;
  if (numZeroes > 0) {
    num= Array(+numZeroes).join("0") + num;
  }
  transformed.gameID=num;
  return transformed;
}


exports.removeFile =async (data)=>{
  const imagePath=path.resolve(__dirname, `../../uploads/images/${data}`)
  await fs.unlinkSync(imagePath);
  return imagePath;
}

exports.createQrCode = (address) => {
    //create QRcode against the wallet address
    const qr = new EthereumQRPlugin()
    return new Promise((resolve, reject) => {
        qr.toDataUrl({
            to: address,
            gas: 42000,
        }).then((qrCodeDataUri) => {
            // console.log('Your QR id generated:', qrCodeDataUri ); //'data:image/png;base64,iVBORw0KGgoA....'
            resolve(qrCodeDataUri.dataURL)
        }).catch((err)=> {
            reject(err)
        })        
    })
}