'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ShopSchema = new Schema({
  name: {type: String, default: "ATN Shop"},
  address: String
})

var Shop = mongoose.model('shop', ShopSchema, 'shops');

module.exports = {
  shopEntity: Shop
}
