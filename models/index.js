'use strict'

const accountModel = require('./account.js');
const orderModel = require('./order.js');
const productModel = require('./product.js');
const shopModel = require('./shop.js');

module.exports = {
  accountModel: accountModel.accountEntity,
  orderModel: orderModel.orderEntity,
  productModel: productModel.productEntity,
  shopModel: shopModel.shopEntity
}
