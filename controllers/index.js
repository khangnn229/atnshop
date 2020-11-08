'use strict'

const home = require('./homeController.js');
const login = require('./loginController.js');
const account = require('./accountController.js');
const order = require('./orderController.js');
const product = require('./productController.js');
const shop = require('./shopController.js');
const report = require('./reportController.js');

module.exports = {
  home: home,
  login: login,
  account: account,
  order: order,
  product: product,
  shop: shop,
  report: report
}
