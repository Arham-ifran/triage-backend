const paypal = require('paypal-rest-sdk');
const Payment = require("../../models/payment.model");
const User = require("../../models/users.model");
const PromoCode = require("../../models/promoCode.model");
const UsedPromoCode = require("../../models/usedPromoCodes.model");
const History = require("../../models/history.model");
const Tokenswallets = require("../../models/tokensWallet.model");
const ObjectId = require('mongoose').Types.ObjectId
var tokenABI = require('../../utils/abi/token.json');
var Contract = require('web3-eth-contract');
const { defaultNetwork, chainsConfigs, baseUrl, frontenUrl } = require("../../../config/vars")
// providerAddress, tokenAddress, walletAccount, walletPK,

let chainConfig = null
if (defaultNetwork === "testnet") {
    chainConfig = chainsConfigs[5]
} else {
    chainConfig = chainsConfigs[1]
}

const Web3 = require('web3');
var ethers = require('ethers');
const signers = new ethers.Wallet(chainConfig.ownerPrivateKey);
let tokenContract = new Contract(tokenABI, chainConfig.primaryToken.address);
var web3 = new Web3(chainConfig.rpcUrl);

//configure for sandbox environment
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.SECRET_APP
});

exports.createPayment = async (req, res) => {
    const { userId, amountPaid, tokenName, tokenId, tokenAddress, promoCodeId, referreralId, referrerPercent } = req.body
    let returnUrl = '';
    if (promoCodeId && referreralId) {
        returnUrl = `${baseUrl}/v1/front/paymentSuccess?userId=${userId}&amountPaid=${amountPaid}&tokenAddress=${tokenAddress}&referreralId=${referreralId}&referrerPercent=${referrerPercent}&promoCodeId=${promoCodeId}`
    }
    else if (promoCodeId && !referreralId) {
        returnUrl = `${baseUrl}/v1/front/paymentSuccess?userId=${userId}&amountPaid=${amountPaid}&tokenAddress=${tokenAddress}&referrerPercent=${referrerPercent}&promoCodeId=${promoCodeId}`
    }
    else if (!promoCodeId && referreralId) {
        returnUrl = `${baseUrl}/v1/front/paymentSuccess?userId=${userId}&amountPaid=${amountPaid}&tokenAddress=${tokenAddress}&referreralId=${referreralId}&referrerPercent=${referrerPercent}`
    }
    else {
        returnUrl = `${baseUrl}/v1/front/paymentSuccess?userId=${userId}&amountPaid=${amountPaid}&tokenAddress=${tokenAddress}`
    }

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": returnUrl,
            "cancel_url": `${baseUrl}/v1/front/paymentCancel`
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": tokenName,
                    "sku": tokenId,
                    "price": amountPaid,
                    "currency": "USD",
                    "quantity": 1 //quantity needs to discuss
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amountPaid,
            },
            "description": `${tokenName} is for the best team ever.`
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    console.log("links = ", payment.links[i].href)
                    return res.status(200).send({ success: true, message: '', link: payment.links[i].href })
                    // res.redirect(payment.links[i].href);
                }
            }
        }
    });
}

exports.processPayment = (req, res) => {
    console.log("req.query ====================================================================> ", req.query)
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const userId = req.query.userId;
    let amountPaid = req.query.amountPaid;
    const tokenAddress = req.query.tokenAddress;
    const connectedWallet = req.query.connectedWallet;
    const promoCodeId = req.query.promoCodeId;
    const referreralId = req.query.referreralId;
    const referrerPercent = req.query.referrerPercent;

    console.log("values = ⭐", payerId, paymentId, userId, amountPaid, tokenAddress, connectedWallet, referreralId, referrerPercent)

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": amountPaid
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {

        if (error) {
            console.log(error.response);
            throw error;
        } else {
            // get the wallet address from the user modal
            let fetchedPromo = await PromoCode.findOne({ _id: promoCodeId })
            let amountCredited = amountPaid;
            const tokenWallet = await Tokenswallets.findOne({ userId: userId })

            // Send Refferrer Percentage in case of first deposit transaction
            const userPaymentData = await Payment.find({ userId })
            console.log("userPaymentData: ", userPaymentData)
            let referralWalletAddress;
            console.log(1, "referreralId: ", referreralId)
            if (referreralId && userPaymentData?.length === 0) {
                const referrerTokenWallet = await Tokenswallets.findOne({ userId: referreralId })
                referralWalletAddress = referrerTokenWallet?.ethereum
                amountCredited = amountPaid - referrerPercent
            }
            console.log(2, referreralId)
            let referralUser = null
            const userEmail = await User.findOne({_id: userId}, {_id: 0, email: 1});
            if (referreralId !== 'undefined') {
                referralUser = await User.findOne({ _id: referreralId })
            }

            console.log(3)
            if (tokenWallet?.ethereum) { //user?.connectedWalletAddress
                let walletAddress = tokenWallet?.ethereum //user?.connectedWalletAddress
                const transferRes = await exports.transferToken(walletAddress, tokenAddress, promoCodeId ? (parseFloat(amountCredited) + parseFloat(fetchedPromo.bonus)) : amountCredited, connectedWallet)

                console.log(4, "referralWalletAddress: ", referralWalletAddress)
                if (referralWalletAddress && userPaymentData.length === 0) {
                    await exports.transferToken(referralWalletAddress, tokenAddress, referrerPercent)
                    await User.findByIdAndUpdate({ _id: referreralId }, { $inc: { referralBonus: referrerPercent } })
                    await History.create({
                        senderAddress: walletAddress,
                        senderId: userId,
                        email: userEmail.email,
                        receiverId: referralUser._id,
                        receiverAddress: referralWalletAddress,
                        historyType: 4,
                        amountSent: referrerPercent,
                        referralCurrency: tokenAddress
                    })
                }

                console.log(5)
                console.log("transfer res == ", transferRes)

                if (transferRes?.status) {
                    // add the payment data into the database
                    if (promoCodeId) {
                        await PromoCode.findByIdAndUpdate({ _id: promoCodeId }, { $inc: { NoOfTimesCodeAvailable: -1 } })
                        let usedPromo = await UsedPromoCode.findOne({ userId, promoCodeId })
                        if (usedPromo) {
                            await UsedPromoCode.findByIdAndUpdate({ _id: usedPromo._id }, { $inc: { noOfTimesUsed: 1 } });
                           
                        }
                        else {
                            await UsedPromoCode.create({ userId, promoCodeId, noOfTimesUsed: 1 })
                        }
                        await History.create({
                            receiverId: userId,
                            // referralCurrency: tokenAddress,
                            // bonusType: 1,
                            // depositAmountCredited: fetchedPromo.bonus,
                            historyType: 5,
                            promoCodeId: promoCodeId,
                        })
                    }

                    await Payment.create({ payerId, paymentId, userId, amountPaid, tokenAddress, txHash: transferRes?.tx, walletAddress }) //txHash this would be there after transfer tokens
                    await History.create({
                        depositAmountSent: amountPaid,
                        depositAmountCredited: fetchedPromo ? (parseFloat(amountCredited) + parseFloat(fetchedPromo.bonus)) : amountCredited,
                        receiverAddress: walletAddress, receiverId: userId, historyType: 1, depositType: 2
                    })

                    // 
                    res.redirect(`${frontenUrl}/payment?type=success`);
                } else {
                    res.redirect(`${frontenUrl}/payment?type=fail`);
                }
            } else {
                res.redirect(`${frontenUrl}/payment?type=fail`);
            }
        }
    });
}

// tranfer primary tokens to the particular address
exports.transferToken = async (walletAddress, tokenAddress, amountPaid) => {
    //calculate the tokens for amount paid
    const tokensAmount = await calculateToken(tokenAddress, amountPaid)

    // transfer token 
    // web3 logic
    return new Promise(async (resolve, reject) => {
        let tokensAmountWei = await web3.utils.toWei(`${tokensAmount}`, 'ether');
        const myData = await tokenContract.methods.transfer(walletAddress, tokensAmountWei).encodeABI();
        let txCount = await web3.eth.getTransactionCount(chainConfig.ownerAddress);
        const gas = await web3.eth.getGasPrice();
        const gasLimit1 = await web3.eth.estimateGas({
            from: chainConfig.ownerAddress,
            nonce: txCount,
            to: tokenAddress,
            data: myData,
        })

        await signers.signTransaction({
            "nonce": web3.utils.toHex(txCount), // 0 in decimal
            "gasLimit": web3.utils.toHex(gasLimit1), //21000 in decimal
            "gasPrice": web3.utils.toHex(gas), //2000000000 in decimal
            "to": tokenAddress,
            "data": web3.utils.toHex(myData), // “empty” value in decimal
        })
            .then(async res => {
                let promises = [];
                let tx = null
                promises.push(web3.eth.sendSignedTransaction(res, async (err, txResult) => {
                    tx = txResult;
                    console.log("tx - ", tx)
                    if(err)
                        console.log("ERROR: ", err);
                    resolve({ status: true, tx: tx })
                }));
                await Promise.all(promises)

            })
            .catch(e => {
                console.error(`error occured during transaction Error ✊ : ${e}`)
                reject({ status: false, tx: null })
            })
    })

}

const calculateToken = (tokenAddress, amountPaid) => {
    // will get the worth of the token from exhanges 
    // logic would be there

    return amountPaid
}