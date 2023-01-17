const path = require('path');
const moment = require("moment");

// import .env variables
require('dotenv').config();

module.exports = {
  defaultCurrency: "TRI", 
  defaultNetwork: process.env.Default_Network,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  encryptionKey: process.env.ENCRYPTION_KEY,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  frontEncSecret: process.env.FRONT_ENC_SECRET,
  emailAdd: process.env.EMAIL,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  mailgunApi:process.env.MAILGUN_API,
  pwEncryptionKey: process.env.PW_ENCRYPTION_KEY,
  pwdSaltRounds: process.env.PWD_SALT_ROUNDS,
  globalImgPlaceholder: '/img/placeholder.png',
  baseUrl: process.env.BASE_URL,
  frontenUrl: process.env.REACT_APP_FRONT_URL,
  // tokenNameToValue: {
  //   'ANN': 1,
  //   'WBNB': 2
  // },
  adminPasswordKey: process.env.ADMIN_PASSWORD_KEY,
  xAuthToken : process.env.XAUTHTOKEN,
  authorization : process.env.AUTHORIZATION,

  // this will remove
  // web3Providers: {
  //   [4]: process.env.PROVIDER_ADDRESS,
  // },
  // tokenAddress: process.env.TRIAGE_TOKEN,
  // providerAddress: process.env.PROVIDER_ADDRESS,
  // walletAccount: process.env.WALLET_ACCOUNT,
  // walletPK: process.env.WALLET_PRIVATE_KEY,
  // tokenWalletsPrivateKey: "0xd049bf84ba76320feb77d3c5412b991fccd42e939e95dd96c6eaa66960ae7dab",
    // idhr tk

  coinMarketApiKey: process.env.COIN_MARKET_API_KEY,

  currencyCapObjectId: "6319d5ecf3ccb2b43b2ebc76",
  currenciesSymbolsList: ["AAVE", "APE", "AXS", "BNB", "BTC", "COMP", "CRV", "DAI", "DYDX", "ETH", "EUR", "FIT", "GALA", "IMX", "LINK", "MANA", "SHIB", "UNI", "USDC", "USDT", "WBTC", "XLM", "XRP", "YFI"],

  //Blockchain related variables
  chainsConfigs: {
    5: {
        nativeCurrency: {
            name: 'Goerli',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        explorer: "https://goerli.etherscan.io/",
        eventKey: 'Goerli',
        title: 'Goerli',
        networkName: 'Goerli Testnet',
        primaryToken: { 
            address: "0xE4081e46D8B851f3bd606eFA11eA7F46fB5eF735",
            valueInUsd: 1
        },
        ownerAddress: "0x564C37233eDC7F3C11418Fda93aeCcC9ABB3f625",
        ownerPrivateKey: "daa6eabf766615c4eddb03fd33a51083856154dc8560df9e310648f661fb1414"
    },
    97: {
        nativeCurrency: {
            name: 'Binance',
            symbol: 'BNB',
            decimals: 18,
        },
        rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
        explorer: "https://testnet.bscscan.com/",
        eventKey: 'Binance',
        title: 'Binance',
        networkName: 'Binance Testnet',
        primaryToken: { 
            address: "0xE4081e46D8B851f3bd606eFA11eA7F46fB5eF735",
            valueInUsd: 1
        },   
        ownerAddress: "0x564C37233eDC7F3C11418Fda93aeCcC9ABB3f625",
        ownerPrivateKey: "daa6eabf766615c4eddb03fd33a51083856154dc8560df9e310648f661fb1414"
    },
    56: {
      nativeCurrency: {
          name: 'Binance',
          symbol: 'BNB',
          decimals: 18,
      },
      rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
      explorer: "https://testnet.bscscan.com/",
      eventKey: 'Binance',
      title: 'Binance',
      networkName: 'Binance Testnet',
      primaryToken: {
          address: "0xE4081e46D8B851f3bd606eFA11eA7F46fB5eF735",
          valueInUsd: 1
      },
      ownerAddress: "0x564C37233eDC7F3C11418Fda93aeCcC9ABB3f625",
      ownerPrivateKey: "daa6eabf766615c4eddb03fd33a51083856154dc8560df9e310648f661fb1414"
    },
    1: {
        nativeCurrency: {
            name: 'EThereum',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        explorer: "https://goerli.etherscan.io/",
        eventKey: 'Ethereum',
        title: 'Ethereum',
        networkName: 'Goerli Testnet',
        primaryToken: { 
            address: "0xE4081e46D8B851f3bd606eFA11eA7F46fB5eF735",
            valueInUsd: 1
        },
        ownerAddress: "0x564C37233eDC7F3C11418Fda93aeCcC9ABB3f625",
        ownerPrivateKey: "daa6eabf766615c4eddb03fd33a51083856154dc8560df9e310648f661fb1414"
    },
  },

  // diff in days
  diffInDays: function ( start, end ) {
    const days = end.diff(start, "days")
    return days  
  },
  
};
