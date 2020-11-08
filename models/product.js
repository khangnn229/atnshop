'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProductSchema = new Schema({
  name: String,
  price: Number,
  currency: String,
  unit: String,
  information: String,
  urlImg: String
})

var Product = mongoose.model('product', ProductSchema, 'products');

module.exports = {
  productEntity: Product
}
