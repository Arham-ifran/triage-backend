const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const frontAuth = require('../api/middlewares/front/auth');
const adminRoutes = require('../api/routes/v1/admin/index');
const frontRoutes = require('../api/routes/v1/front/index');
const error = require('../api/middlewares/error');
const path = require('path');
const rateLimit = require("express-rate-limit");
const bearerToken = require('express-bearer-token');
const compression = require('compression');
const paypalMethod = require('../api/controllers/front/payment.controller');
const cron = require('node-cron');
const CurrencyCap = require("../api/models/currencyCap.model");
const vars = require("./vars")
const axios = require("axios");
// const Stake = require("../api/models/stake.model")
// const StakeController = require("../api/controllers/front/stake.controller")

/**
* Express instance
* @public
*/
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bearerToken());

app.use(methodOverride());
const apiRequestLimiterAll = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 90000

});

app.use(express.static(path.join(__dirname, "../uploads")));
app.use(express.static(path.join(__dirname, "../../admin/static/css")));

// app.use("/v1/", apiRequestLimiterAll);

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

// compress all responses
app.use(compression());

// paypal payment routes
app.post('/v1/front/paymentCreate', paypalMethod.createPayment);
app.get('/v1/front/paymentSuccess', paypalMethod.processPayment);
app.get('/v1/front/paymentCancel', (req, res) => res.send('Cancelled'));

// authentication middleware to enforce authnetication and authorization
app.use(frontAuth.userValidation);

// authentication middleware to get token
app.use(frontAuth.authenticate);

// mount admin api v1 routes
app.use('/v1/admin', adminRoutes);

// mount admin api v1 routes
app.use('/v1/front', frontRoutes);


// Admin Site Build Path
app.use('/admin/', express.static(path.join(__dirname, '../../admin')))
app.get('/admin/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../../admin', 'index.html'));
});

// Front Site Build Path
app.use('/', express.static(path.join(__dirname, '../../build')))
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

// fn to update the latest values in usd to each token 
const updateCurrenciesValues = () => {
  const coinList = vars.currenciesSymbolsList
  for (let index = 0; index < coinList.length; index++) {
    const symbol = coinList[index];
    const options = {
      url: `https://pro-api.coinmarketcap.com/v2/tools/price-conversion?amount=1&symbol=${symbol}&convert=USD`,
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': vars.coinMarketApiKey
      },
    };
     Promise.all(axios(options)
     .then(async (response) => {
      let usdValue = response.data.data[0].quote.USD.price
      await CurrencyCap.findOneAndUpdate({_id: vars?.currencyCapObjectId}, { [`${symbol}InUSD`] : usdValue })
     })
     .catch(error => { console.log(error)})) 
  }    
}

//initialize cron job to trigger after every 10 minutes, to check the block number
const updateCurrencyCronJob = async () => {
  cron.schedule('*/30 * * * *', () => {
    // console.log("Update Currency Cron Job is Started.")
    updateCurrenciesValues()
  });
}

// const stakedInterestCronJob = async () => {
//   cron.schedule('0 0 * * *', () => {
//     console.log("Staked Interest Cron Job is Started.")
//     StakeController.stakedInterest();
//   });
// }

updateCurrencyCronJob();
// stakedInterestCronJob();

module.exports = app;