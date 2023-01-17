var mongoose = require('mongoose');

const currencyCap = new mongoose.Schema(
    {  
        AVAVEInUSD: {type: Number, default: 0},
        APEInUSD: {type: Number, default:0},
        AXSInUSD: {type: Number, default: 0},
        BNBInUSD: {type: Number, default: 0},
        BTCInUSD: {type: Number, default: 0},
        COMPInUSD: {type: Number, default: 0},
        CRVInUSD: {type: Number, default: 0},
        DAIInUSD: {type: Number, default: 0},
        DYDXInUSD: {type: Number, default: 0},
        ETHInUSD: {type: Number, default: 0},
        EURInUSD: {type: Number, default: 0},
        FITInUSD: {type: Number, default: 0},
        GALAInUSD: {type: Number, default: 0},
        IMXInUSD: {type: Number, default: 0},
        LINKInUSD: {type: Number, default: 0},
        MANAInUSD: {type: Number, default: 0},
        SHIBInUSD: {type: Number, default: 0},
        UNIInUSD: {type: Number, default: 0},
        USDCInUSD: {type: Number, default: 0},
        USDTInUSD: {type: Number, default: 0},
        WBTCInUSD: {type: Number, default: 0},
        XLMInUSD: {type: Number, default: 0},
        XRPInUSD: {type: Number, default: 0},
        YFIInUSD: {type: Number, default: 0},
    },
    {
        timestamps: 0
    }
);

module.exports = mongoose.model("CurrencyCap", currencyCap);
