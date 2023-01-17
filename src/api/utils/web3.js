const Web3 = require('web3')
const { chainsConfigs, defaultNetwork } = require('../../config/vars');
const { createQrCode } = require("../../api/utils/util")
const { ethers } = require('ethers')
const Contract = require('web3-eth-contract')
const erc20ABI = require("../utils/abi/erc20.json")

const call = (method, params) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve, reject) => {
        method(...params)
            .call()
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const send = (method, params, from, value) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve, reject) => {
        method(...params)
            .send({from, value})
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const methods = {
    call,
    send,
};

// sign the wallet
const signWallet = async(privateKey) => {
    const signers = await new ethers.Wallet(privateKey);
    return signers
}

const getWeb3Instance = (networkId) => {
    let web3 = null
    web3 = new Web3(chainsConfigs[networkId].rpcUrl);

    return web3
}

// creating the wallet from the defined address
exports.createEthWallet = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let web3 = null
            if(defaultNetwork === "testnet"){
                web3 = await new Web3(chainsConfigs[5].rpcUrl)
            }else {
                web3 = await new Web3(chainsConfigs[1].rpcUrl)
            }
            const ethAccount = web3.eth.accounts.create()
            const qrCodeData = await createQrCode(ethAccount.address)
            ethAccount["qrCode"] = qrCodeData
            resolve(ethAccount)
        }catch(e) {
            reject(false)
        }
    })
}

// get token balance of address
exports.getBalanceOfToken = async (networkId, tokenAddress, walletAddress) => {

    const web3 = await getWeb3Instance(networkId);
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {
        if (tokenAddress === "0x0"){
            const balance = await web3.eth.getBalance(walletAddress)
            const balanceInEth = await web3.utils.fromWei(`${balance}`, 'ether');

            return balanceInEth;
        }else {
            let tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
            const balance = await methods.call(tokenContract.methods.balanceOf, [walletAddress]);
            const balanceInEth = await web3.utils.fromWei(`${balance}`, 'ether');

            return balanceInEth;
        }
    }catch (e) {
        console.log(e);
        return false;
    }
}

// send profit to user wallet 
exports.sendProfit = async (contractAddress, contractABI, amount, senderAddress, senderPrivateKey, receiverAddress, networkId) => {
    try{
        const tx = await sendTx(contractAddress, contractABI, amount, senderAddress, senderPrivateKey, receiverAddress, networkId)
        console.log("tx = ", tx)
        return tx
    }catch (e) {
        console.log("Error = ", e);
        return false;
    }
}

// send amount to admin wallet
exports.sendAmountToAdmin = async (contractAddress, contractABI, amount, senderAddress, senderPrivateKey, receiverAddress, networkId) => {
    try{
        // calculate gas fee 
        const gasLimit = await calculateGasFee(contractAddress, networkId, senderAddress, amount)
        console.log("step 1 gass sending ")
        const res = await sendGasFee(gasLimit, contractAddress, networkId, senderPrivateKey, senderAddress)
        console.log("sendGasFee = ", res)

        const tx = await sendTx(contractAddress, contractABI, amount, senderAddress, senderPrivateKey, receiverAddress, networkId)
        console.log("tx = ", tx)
        return tx
    }catch (e) {
        console.log("Error = ", e);
        return false;
    }
}

// send sign transaction 
const sendTx = async (contractAddress, contractABI, amount, senderAddress, senderPrivateKey, receiverAddress, networkId) => {
    return new Promise(async (resolve, reject) => {

        if (contractAddress === "0x0") {
            // when there is native currency and contract address is 0x0
            const web3 = await getWeb3Instance(networkId)
            let amountInWei = await web3.utils.toWei(`${amount}`, 'ether');
            const signTx = await web3.eth.accounts.signTransaction({
                to: receiverAddress,
                value: amountInWei,
                gas: 2000000
            }, senderPrivateKey)

            await web3.eth.sendSignedTransaction(signTx.rawTransaction).then((receipt) => {
                resolve({ status: true, tx: receipt })
            }).catch(e => {
                console.error(`actual Gas fee calculation error occured during transaction Error ✊ : ${e}`)
                reject({ status: false, tx: null })
            })
        } else {
            const signer = await signWallet(senderPrivateKey);
            const web3 = await getWeb3Instance(networkId)
            let contract = new Contract(contractABI, contractAddress);
        
            let amountInWei = await web3.utils.toWei(`${amount}`, 'ether');
            const data = await contract.methods.transfer(receiverAddress, amountInWei).encodeABI();
            let txCount = await web3.eth.getTransactionCount(senderAddress);
            const gas = await web3.eth.getGasPrice();
            const gasLimit1 = await web3.eth.estimateGas({
                from: senderAddress,
                nonce: txCount,
                to: contractAddress,
                data: data,
            })
            await signer.signTransaction({
                "nonce": web3.utils.toHex(txCount),
                "gasLimit": web3.utils.toHex(gasLimit1),
                "gasPrice": web3.utils.toHex(gas),
                "from": senderAddress,
                "to": contractAddress,
                "data": web3.utils.toHex(data),
            })
            .then(async res => {
                let promises = [];
                let tx = null
                promises.push(web3.eth.sendSignedTransaction(res, async (err, txResult) => {
                    tx = txResult;
                    console.log("tx hash : ", tx)
                    resolve({ status: true, tx: tx })
                }));
                await Promise.all(promises)
            })
            .catch(e => {
                console.error(`transfer error occured during transaction Error ✊ : ${e}`)
                reject({ status: false, tx: null })
            })
        }
    })
}

// calculate gas fee for the transaction
const calculateGasFee = async (tokenAddress, networkId, tokenWalletAddress, tokensAmountToTranfer) => {

    if (tokenAddress === "0x0") {
        const web3 = await getWeb3Instance(networkId)
        const gasPrice = await web3.eth.getGasPrice()
        let tokensAmountWei = await web3.utils.toWei(`${tokensAmountToTranfer}`, 'ether');
        let txCount = await web3.eth.getTransactionCount(tokenWalletAddress);
        const gasLimit = await web3.eth.estimateGas({
            from: tokenWalletAddress,
            nonce: txCount,
            data: null,
            value: tokensAmountWei
        })
        return gasLimit * gasPrice
    } else {
        let tokenContract = new Contract(erc20ABI, tokenAddress);
        const web3 = await getWeb3Instance(networkId)
        const gasPrice = await web3.eth.getGasPrice()

        let tokensAmountWei = await web3.utils.toWei(`${tokensAmountToTranfer}`, 'ether');
        const myData = await tokenContract.methods.transfer(chainsConfigs[networkId].ownerAddress, tokensAmountWei).encodeABI();
        let txCount = await web3.eth.getTransactionCount(tokenWalletAddress);
        const gasLimit = await web3.eth.estimateGas({
            from: tokenWalletAddress,
            nonce: txCount,
            to: tokenAddress,
            data: myData,
        })
        return gasLimit * gasPrice
    }
}

// will check the balance of that token wallet address and then transfer the remaining amount of gas but accumulation would be the 2x of the gas fee which will be consumed for the transaction 
const sendGasFee = async (gasLimit, tokenAddress, networkId, tokenWalletPrivateKey, tokenWalletAddress) => {

    const web3 = await getWeb3Instance(networkId)
    let gasNeedToTransfer = gasLimit

    return new Promise(async (resolve, reject) => {
        // let tokenAsGas = await calculateTokenAmount(tokenAddress, gasNeedToTransfer)
        // tokenAsGas = await weitoEth(tokenAsGas)
        // console.log("tokenAsGas ⭐", tokenAsGas)
        // if(tokenAsGas !== 0){
        //     const tokenGasTx = await sendTokenAsGas(tokenAddress, networkId, tokenWalletPrivateKey, tokenWalletAddress, tokenAsGas)
        //     console.log("tokenGasTx  =", tokenGasTx)
        // }
        const signTx = await web3.eth.accounts.signTransaction({
            to: tokenWalletAddress,
            value: gasNeedToTransfer,
            gas: 2000000
        }, chainsConfigs[networkId].ownerPrivateKey)

        await web3.eth.sendSignedTransaction(signTx.rawTransaction).then((receipt) => {
            // console.log("Gas Fee Transfer Tx Receipt (ower - token wallet ) => ", receipt)
            resolve({ status: true, tx: receipt })
        }).catch(e => {
            console.error(`actual Gas fee calculation error occured during transaction Error ✊ : ${e}`)
            reject({ status: false, tx: null })
        })
    })
}

// send gas in token to admin from user wallet address 
// const sendTokenAsGas = async(tokenAddress, networkId, tokenWalletPrivateKey, tokenWalletAddress, tokensAmountToTranfer) => {
//     return new Promise(async (resolve, reject) => {
//         console.log("In sendTokenAsGas tokenAddress, networkId, tokenWalletPrivateKey, tokenWalletAddress, tokensAmountToTranfer")
//         console.log(tokenAddress, networkId, tokenWalletPrivateKey, tokenWalletAddress, tokensAmountToTranfer)
    
//         try {
//             // send token from tokenWallet to owner address 
//             const tx1 = await sendTx(tokenAddress, erc20ABI, tokensAmountToTranfer, tokenWalletAddress, tokenWalletPrivateKey, chainsConfigs[networkId].ownerAddress, networkId, 6) //6 type for gass token transfer
//             console.log("tx1 hash ⭐ : ", tx1)
//             resolve(tx1)
//         } catch (e) {
//             console.log("Error = ", e);
//             reject(false)
//         }
//     })
// }