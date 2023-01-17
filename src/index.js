Promise = require('bluebird');
const { port } = require('./config/vars');
const mongoose = require('./config/mongoose');
const app = require('./config/express');
app.set("view engine", "ejs");
const http = require('http');
mongoose.connect();
http.createServer(app).listen(port);
console.log(`App is running on ${port}`)
module.exports = app;