'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AccountSchema = new Schema({
  staffId: String,
  username: String,
  password: String,
  role: Number,
  workingShop: mongoose.Schema.ObjectId,
  profile: {
    fullname: String,
    dob: Date,
    phone: String,
    email: String,
    urlImg: String
  },
  createdDate: {type: Date, default: Date.now}
})

var Account = mongoose.model('account', AccountSchema, 'accounts');

module.exports = {
  accountEntity: Account
}
