const History = require('../models/history.model')

exports.insert = async(data = null) => {
    if(Object.keys(data).length === 0){
        return { status: false, message: 'Given Data Is Null.' }
    }
    await History.create(data)
}