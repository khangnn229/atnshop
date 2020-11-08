'use strict'

const config = require('../config');

module.exports = {
  getList: getList,
  getDetails: getDetails,
  update: update,
  getCreateView: getCreateView,
  create: create,
  getSelf: getSelf
}

var MongooseConnect = require('../lib/MongoConnect.js'),
    Models = require('../models');

function getList(request, response) {
  if (!request.session.user){
    return response.redirect('/login');
  }
  var query = {}
  if (request.session.user.role > 0) {
    query.workingShop = MongooseConnect.ToObjectId(request.session.user.workingShop._id);
  }
  var page = "account";
  MongooseConnect.Connect(config.database.name)
    .then (db => {
      Models.accountModel.aggregate([
        {$match: query}, 
        {$project: {password: 0, __v: 0}}, 
        {$lookup: {from: 'shops', localField: 'workingShop', foreignField: '_id', as: 'workingShop'}}, 
        {$unwind: {path: '$workingShop', preserveNullAndEmptyArrays: true}},
        {$sort: {role: 1, staffId: 1}}], function (error, result) {
        if (error) {
          return response.render('accountList', {page: page, exitcode: 1, user: request.session.user, accounts:[], message: error});
        }

        response.render('accountList', {page: page, exitcode: 200, user: request.session.user, accounts: result, message: ''})
      })
    })
    .catch (err => {
      console.log('account_controller_getList: ' + err);
      response.render('accountList', {page: page, exitcode: 1, user: request.session.user, accounts: [], message: err});
    })
}

function getDetails(request, response) {
  if (!request.session.user){
    return response.redirect('/login');
  }
  if (!request.params.id){
    return response.redirect('/account-list');
  }
  var query = {
    staffId: request.params.id
  };
  var page = "account";
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.accountModel.aggregate([
        {$match: query}, 
        {$project: {password: 0, __v: 0}}, 
        {$lookup: {from: 'shops', localField: 'workingShop', foreignField: '_id', as: 'workingShop'}}, 
        {$unwind: {path: '$workingShop', preserveNullAndEmptyArrays: true}}], function (error, result) {
          if (error) {
            return response.render('accountDetails', {page: page, user: request.session.user, exitcode: 1, details: {}, message: error});
          }

          if (result.length > 0){
            let customDate = "";
            customDate += result[0].profile.dob.getDate() + "/";
            customDate += (result[0].profile.dob.getMonth() < 10? "0" : "") + result[0].profile.dob.getMonth() + "/";
            customDate += result[0].profile.dob.getYear();
            result[0].profile.dob = customDate;
            response.render('accountDetails', {page: page, user: request.session.user, exitcode: 200, details: result[0], message: ''})
          }
          else {
            response.render('accountDetails', {page: page, user: request.session.user, exitcode: 404, details: {}, message: 'Not existing'})
          }
        }
      )
    })
    .catch(err => {
      console.log('account_controller_getdetails: ' + err);
      return response.render('accountDetails', {page: page, user: request.session.user, exitcode: 1, details: {}, message: error});
    })
}

function getCreateView(request, response) {
  if (!request.session.user){
    return response.redirect('/login');
  }
  var page = "account";
  response.render('accountCreate', {page: page, user: request.session.user, exitcode: 200, user: request.session.user, message: ''});
}

function create(request, response) {
  if (!request.session.user){
    return response.redirect('/login');
  }
  var query = {
    staffId: request.body.staffId,
    username: request.body.username.toLowerCase().trim(),
    password: request.body.password,
    role: request.body.role,
    createdDate: Date(Date.now())
  }
  if (request.body.role > 0 && request.body.workingShop) {
    query.workingShop = MongooseConnect.ToObjectId(request.body.workingShop);
  }
  if (request.body.fullname || request.body.dob || request.body.phone || request.body.email || request.body.urlImg) {
    query.profile = {};
  }
  if (request.body.fullname){
    query.profile.fullname = request.body.fullname;
  }
  if (request.body.dob){
    query.profile.dob = request.body.dob;
  }
  if (request.body.phone){
    query.profile.phone = request.body.phone;
  }
  if (request.body.email){
    query.profile.email = request.body.email;
  }
  var page = "account";
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.accountModel.findOne({$or: [{staffId: request.body.staffId}, {username: request.body.username.toLowerCase().trim()}]}, function(error, result) {
        if (error) {
          return response.render('accountCreate', {page: page, user: request.session.user, exitcode: 1, user: request.session.user, message: error});
        }

        if (result){
          return response.render('accountCreate', {page: page, user: request.session.user, exitcode: 1, user: request.session.user, message: 'The staff ID or username has been used'});
        }
        else {
          Models.accountModel.create(query, function (error, result){
            if (error) {
              return response.render('accountCreate', {page: page, user: request.session.user, exitcode: 1, user: request.session.user, message: error});
            }
            return response.render('accountCreate', {page: page, user: request.session.user, exitcode: 200, user: request.session.user, message: 'Created successfully'});
          })
        }
      })
    })
    .catch(err => {
      console.log('account_controller_create: ' + err);
      response.render('accountCreate', {page: page, exitcode: 1, user: request.session.user, message: err});
    })

}

function getSelf(request, response) {
  if (!request.session.user){
    return response.redirect('/login');
  }
  var query = {
    staffId: request.session.user.staffId
  };
  var page = 'self';
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.accountModel.aggregate([
        {$match: query}, 
        {$project: {password: 0, __v: 0}}, 
        {$lookup: {from: 'shops', localField: 'workingShop', foreignField: '_id', as: 'workingShop'}}, 
        {$unwind: {path: '$workingShop', preserveNullAndEmptyArrays: true}}], function (error, result) {
          if (error) {
            return response.render('accountDetails', {page: page, user: request.session.user, exitcode: 1, details: {}, message: error});
          }

          if (result.length > 0){
            let customDate = "";
            customDate += result[0].profile.dob.getDate() + "/";
            customDate += (result[0].profile.dob.getMonth() < 10? "0" : "") + result[0].profile.dob.getMonth() + "/";
            customDate += result[0].profile.dob.getYear();
            result[0].profile.dob = customDate;
            response.render('accountDetails', {page: page, user: request.session.user, exitcode: 200, details: result[0], message: ''})
          }
          else {
            response.render('accountDetails', {page: page, user: request.session.user, exitcode: 404, details: {}, message: 'Not existing'})
          }
        }
      )
    })
    .catch(err => {
      console.log('account_controller_getdetails: ' + err);
      return response.render('accountDetails', {page: page, user: request.session.user, exitcode: 1, details: {}, message: error});
    })
}

function update(request, response) {

}
