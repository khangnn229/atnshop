'use strict'

const { request } = require('express');
const config = require('../config');

module.exports = {
  getListJSON: getListJSON,
  getList: getList,
  getDetails: getDetails
}

var MongooseConnect = require('../lib/MongoConnect.js'),
    Models = require('../models');

    
function getListJSON(request, response) {
  var query = {}
  if (request.session.user.workingShop){
    query._id = request.session.user.workingShop;
  }
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.shopModel.find(query, function(error, result){
        if (error) {
          return response.json({
            shopList: []
          })
        }

        response.json({
          shopList: result
        });
      })
    })
    .catch(err => {
      console.log('shop_controller_getlistjson: ' + err);
      response.json({
        shopList: []
      })
    })
}

function getList(request, response) {
  if (!request.session.user){
    return response.redirect('/login');
  }
  if (request.session.user.role > 0) {
    return response.redirect(`/shop/${request.session.user.workingShop._id}`)
  }
  var query = {}
  if (request.session.user.workingShop){
    query.workingShop = request.session.user.workingShop;
  }
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.shopModel.find(query, function(error, result){
        if (error) {
          return response.render('shopList', {page: 'shop', user: request.session.user, exitcode: 1, shops: [], message: error});
        }
        return response.render('shopList', {page: 'shop', user: request.session.user, exitcode: 1, shops: result, message: error});
      })
    })
    .catch(err => {
      console.log('shop_controller_getlist: ' + err);
      return response.render('shopList', {page: 'shop', user: request.session.user, exitcode: 1, shops: [], message: err});
    })
}

function getDetails(request, response) {
  if (!request.session.user){
    return response.redirect('/login');
  }
  if (request.session.user.workingShop && request.params.id != request.session.user.workingShop._id){
    return response.redirect(`/shop/${request.session.user.workingShop._id}`);
  }
  var shopId = MongooseConnect.ToObjectId(request.params.id);
  var query = {
    _id: shopId
  };
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.shopModel.aggregate([
        {$match: query},
        {$lookup: {from: "accounts", localField: "_id", foreignField: 'workingShop', as: 'members'}},
        {$project: {_id: 1, 
                    name: 1, 
                    address: 1, 
                    members: {
                      $map: {
                        input: '$members', 
                        as: 'member', 
                        in: {
                          _id: '$$member._id',
                          staffId: '$$member.staffId',
                          username: '$$member.username',
                          role: '$$member.role',
                          profile: '$$member.profile'
                        }
                      }
                    } 
                  }
          }
      ], function (error, result) {
        if (error) {
          return response.render('shopDetails', {page: 'shop', user: request.session.user, exitcode: 1, shop: {}, staff: {}, message: error});
        }
        if (result.length > 0) {
          response.render('shopDetails', {page: 'shop', user: request.session.user, exitcode: 200, shop: result[0], message: 'Not found shop'});
        }
        else {
          response.render('shopDetails', {page: 'shop', user: request.session.user, exitcode: 404, shop: {}, staff: {}, message: 'Not found shop'});
        }
      })
    })
    .catch(err => {
      console.log('shop_controller_getdetails: ' + err);
      return response.render('shopDetails', {page: 'shop', user: request.session.user, exitcode: 1, shop: {}, staff: {}, message: err});
    })
}
