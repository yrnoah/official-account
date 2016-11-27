const express = require('express');
const app = express();
const config = require('../config')
const proxyMiddleware = require('http-proxy-middleware')
const proxyTable = config.prod.proxyTable
const wechat = require('wechat');
const bodyParser = require('body-parser');
const path = require('path');
const WechatApi = require('wechat-api');
const WechatOauth = require('wechat-oauth');
const Payment = require('wechat-pay');

const Promise = require('bluebird');
const db = require('sqlite');

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const swig = require('swig');

const [token, appid, EncodingAESKey, appsecret] =
      ['xjbtoken2333', 'wx818254b4c2b5bb7e', '49a35f5b9483e8f0011cf568b69c0d66', '49a35f5b9483e8f0011cf568b69c0d66'];
const api = new WechatApi(appid, appsecret);
const client = new WechatOauth(appid, appsecret);

import serverApi from './api';
console.log(serverApi)
let url;
app.set('view engine', 'html');
app.set('view cache', false);

app.use(logger('dev'));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist'), {'extensions': ['html']}));
app.engine('html', swig.renderFile);
app.use(express.query());


const wechatConfig = {
  token,
  appid,
  EncodingAESKey,
}

// Error Handlers
if (app.get('env') === 'development') {
  // development error handler, will print stacktrace
  renderError(true);
} else {
  // production error handler, no stacktrace leaked to user
  renderError(false);
}
function renderError(sendErrorObj) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: sendErrorObj ? err : {}
    });
  });
}

let wechat_api;

app.use('/wechat', wechat('xjbtoken2333', (req, res, next) => {
  next()
}))

app.get('/oauth', (req, res, next) => {
  url = client.getAuthorizeURL('https://api.wizwork.cn/select', 'momo233', 'snsapi_base');
  res.redirect(url);
});
app.get('/test', (req, res, next) => {
  res.send('test')
})
app.get('/home', (req, res, next) => {
  res.render('home');
})

app.use('/api', serverApi);



// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });



// app.use('/wechat_api', (req, res, next) => {
//   console.log(api);
//   res.send({ api, wechat, protypes:api.proptypes });
//   next();
// });

// Object.keys(proxyTable).forEach(function (context) {
//   var options = proxyTable[context]
//   if (typeof options === 'string') {
//     options = { target: options }
//   }
//   app.use(proxyMiddleware(context, options))
// })

const port = 8001;

Promise.resolve()
  // First, try connect to the database and update its schema to the latest version 
  .then(() => db.open('./database.db', { Promise }))
  .catch(err => console.error(err.stack))
  .finally(() => app.listen(port, (err) => { console.log("http oppened on " + port) }));
