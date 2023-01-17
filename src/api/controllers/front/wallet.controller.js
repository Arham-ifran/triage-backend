const Wallet = require("../../models/wallets.model")
const CurrencyCap = require("../../models/currencyCap.model")
const vars = require("../../../config/vars")
const Stake = require("../../models/stake.model")
const Criteria = require("../../models/criteria.model")
const { getBalanceOfToken } = require("../../utils/web3") 
const TokensWallet = require("../../models/tokensWallet.model")
const WireRequest = require("../../models/wirerequest.model")
const History = require('../../models/history.model')
const ObjectId = require('mongoose').Types.ObjectId
const AccountTier = require("../../models/accountTiers.model")


// API to get a Wallet
exports.get = async (req, res, next) => {
    try {
        const { walletId } = req.params
        if (walletId) {
            const wallet = await Wallet.findOne({ _id: walletId }, { _id: 1, walletAddress: 1, status: 1, name: 1, logo: 1, qrCode: 1, type: 1, interestRate: 1}).lean(true)
            if (wallet)
                return res.json({ success: true, message: 'Wallet retrieved successfully', wallet })
            else return res.status(400).send({ success: false, message: 'Wallet not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Wallet Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get Wallet list
exports.list = async (req, res, next) => {
    try {
        const userId = req.user
        const tokenWallets = await TokensWallet.findOne({ userId: userId })

        let wireRequestFilter = {
            receiverId: ObjectId(userId),
            historyType: 1,
            depositType: 1,
            receiptUploaded :false
        }

        const wireRequests = await History.find(wireRequestFilter)
        let { page, limit } = req.query
        let { symbols = [], symbolText, sortByName } = req.body
        const filter = { status: true}

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        if(symbols.length){
            filter.symbol = { $in: [ ...symbols] }
        }

        if(symbolText !== undefined){
            filter.symbol = {$regex: symbolText, $options: 'i'}
        }

        let sortObj = { name: -1}

        if(sortByName === "name"){
            sortObj.name = 1
        }
        
        const total = await Wallet.countDocuments(filter)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        const wallets = await Wallet.aggregate([
            { $match : filter },
            { $sort: sortObj },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $project: {
                    _id: 1, walletAddress: 1, status: 1, name: 1, logo: 1, symbol: 1, networkId: 1, qrCode: 1, type: 1, interestRate: 1
                }
            }
        ])


        let walletsDataArray = []
        for (let index = 0; index < wallets.length; index++) {
            const e = wallets[index];
            console.log("calling", userId, e.symbol)
            let stakedAmount =  await getTheStakedAmount(userId, e.symbol)
            console.log('after stakedAmount = ', stakedAmount)
            e["stakedAmount"] = stakedAmount
            walletsDataArray.push({...e})
        }
        const currencyCaps = await CurrencyCap.findById({_id: vars.currencyCapObjectId})
        const timePeriod = await Criteria.find({}, 'months')

        const bronzeLevel = await AccountTier.findOne({ level: 1 })
        const bronzeMinInvestment = await Criteria.findOne({ accountTierId: ObjectId(bronzeLevel._id) }, {minInvestment :1, _id:0})


        let sortedWalletArray  = []
 
        if(sortByName === "balance"){
    
            let walletsArray = []

            for (let index = 0; index < wallets.length; index++) {
                const e = wallets[index];
                let userTokenWallet = null
                if(e.networkId === 1 || e.networkId === 5 ){
                    userTokenWallet = tokenWallets.ethereum
                }else if(e.networkId === 97 || e.networkId === 56){
                    userTokenWallet = tokenWallets.ethereum
                }else {}
                const tokenBalance = await getBalanceOfToken(e.networkId, e.walletAddress, userTokenWallet)
                e.tokenBalance = tokenBalance
                walletsArray.push(e)
            }
            
            sortedWalletArray = await walletsArray.sort((a, b) => {
                return b.tokenBalance - a.tokenBalance;
            })

            return res.send({
                success: true, message: 'Wallets fetched successfully',
                data: {
                    wallets: sortedWalletArray,
                    currencyCaps,
                    pagination: {
                        page, limit, total,
                        pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                    }
                }
            })
        }

        return res.send({
            success: true, message: 'Wallets fetched successfully',
            data: {
                wallets: walletsDataArray,
                bronzeMinInvestment: bronzeMinInvestment.minInvestment,
                wireRequests: wireRequests.length,
                currencyCaps,
                timePeriod,
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

// get the wallet symbol list
exports.symbolList = async (req, res, next) => {
    try {
        const symbols = await Wallet.find({ }, {symbol:1})
        const tempSymbol = await symbols.map((e) => e.symbol)
        return res.status(200).send({ success: true, message: 'Symbols fetched successfully.', symbols: tempSymbol })
    } catch (error) {
        return next(error)
    }
}


const getTheStakedAmount = async (userId, currency) => {
    return new Promise(async (resolve, reject) => {

        const stakeAmount = await Stake.find({ userId })
        let accumulatedAmt = 0
        for (let index = 0; index < stakeAmount.length; index++) {
            const stakeObj = stakeAmount[index];
            let criterias = await Criteria.find({  _id: stakeObj.criteriaId })
            for (let index = 0; index < criterias.length; index++) {
                const criteriaObj = criterias[index];
                if(criteriaObj.currency == currency ){
                    accumulatedAmt = accumulatedAmt + stakeObj.depositedAmount
                }   
            }
        }

        resolve(accumulatedAmt);
    })
}