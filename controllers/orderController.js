'use strict'

const config = require('../config');

module.exports = {
  create: create,
  getCreateView: getCreateView,
  getPayment: getPayment
}

var MongooseConnect = require('../lib/MongoConnect.js'),
    Models = require('../models');

function getCreateView(request, response) {
  if (!request.session.user){
    return response.redirect('/login');
  }
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.productModel.find({}, function(error, result) {
        if (error) {
          response.render('orderCreate', {page: 'order', exitcode: 1, user: request.session.user, products: [], message: error});
        } 
        
        response.render('orderCreate', {page: 'order', exitcode: 200, user: request.session.user, products: result, message: ''});
      })
    })
    .catch(err => {
      console.log('order_controller_getCreateView: ' + err);
      response.render('orderCreate', {page: 'order', exitcode: 1, user: request.session.user, products: [], message: err});
    })
}

function getPayment(request, response) {
  var cart = JSON.parse(request.body.cart);
  var cartjson = {};
  var products = [];
  for (var i = 0; i < cart.products.length; i++) {
    products.push({_id: cart.products[i]._id, quantity: cart.products[i].quantity});
  }
  cartjson.products = products;
  cartjson = JSON.stringify(cartjson);
  response.render('payment', {page: 'order', exitcode: 200, user: request.session.user, cart: cart, cartjson: cartjson, createdDate: Date(Date.now()), message: ''});
}

function create(request, response) {
  var cart = JSON.parse(request.body.cart);
  var query = {
    staffId: request.body.staffId,
    itemList: cart.products,
    orderedDate: request.body.createdDate
  }
  for (var i = 0; i < query.itemList.length; i++) {
    query.itemList[i]._id = MongooseConnect.ToObjectId(query.itemList[i]._id);
  }
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.orderModel.create(query, function(error, result) {
        if (error) {
          return response.render('order-result', {page: 'order', user: request.session.user, exitcode: 1, message: error});
        }

        response.render('order-result', {page: 'order', user: request.session.user, exitcode: 200, message: ''});
      })
    })
    .catch(err => {
      console.log('order_controller_create: ' + err);
      return response.render('order-result', {page: 'order', user: request.session.user, exitcode: 1, message: err});
    })
}
