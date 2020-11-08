'use strict'

const express = require('express');
const app = express();
const config = require('./config');
const controllers = require('./controllers')
var session = require('express-session');
var path = require('path');
const { nextTick } = require('process');
var router = express.Router();

var sess = {
  secret: config.server.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: config.server.sessionMaxAge
  }
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

//#region middleware

app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(express.json())
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(session(sess));

app.use(function(request, response, next) {
  if (request.originalUrl != '/login' && !request.session.user) {
    response.redirect('/login');
  }
  else {
    next();
  }
})

//#endregion

//Home
app.get('/', controllers.home.getView);

//Login
app.get('/login', controllers.login.getView);
app.post('/login', controllers.login.authenticate);
app.get('/logout', controllers.login.logout)

//User Management
app.get('/account-list', controllers.account.getList);
app.get('/account/:id', controllers.account.getDetails);
app.put('/account/:id', controllers.account.update);
app.get('/account-create', controllers.account.getCreateView);
app.post('/account-create', controllers.account.create);
app.get('/self', controllers.account.getSelf);

//Shop
app.get('/shop-list-json', controllers.shop.getListJSON);
app.get('/shop-list', controllers.shop.getList);
app.get('/shop/:id', controllers.shop.getDetails);

//Order
app.get('/order', controllers.order.getCreateView);
app.post('/payment', controllers.order.getPayment);
app.post('/order-create', controllers.order.create);

//Report
app.get('/report', controllers.report.getView);
app.post('/getReport', controllers.report.getReport);

app.listen(config.server.port, () => {
  console.log(`Web app listening at the port ${config.server.port}...`);
})
