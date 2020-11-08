'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OrderSchema = new Schema({
  staffId: String,
  itemList: [
    {
      itemId: mongoose.Schema.ObjectId,
      quantity: Number
    }
  ],
  orderedDate: {type: Date, default: Date.now}
})

var Order = mongoose.model('order', OrderSchema, 'orders');

module.exports = {
  orderEntity: Order
}
