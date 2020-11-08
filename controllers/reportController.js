'use strict'

const session = require('express-session');
const config = require('../config');
const MongoConnect = require('../lib/MongoConnect.js');

module.exports = {
  getView: getView,
  getReport: getReport
}

var MongooseConnect = require('../lib/MongoConnect.js'),
    Models = require('../models');

function getView(request, response) {
  response.render('report', {page: 'report', user: request.session.user});
}

function getReport(request, response) {
  console.log(request.body);
  var shopList = request.body.shopList
  var query = {
    shopList: []
  }
  shopList.forEach(shop => {query.shopList.push(MongooseConnect.ToObjectId(shop))});
  var today = new Date(Date.now());
  query.month = today.getMonth()+1;
  query.year = today.getFullYear();
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.orderModel.aggregate([
        {
          '$addFields': {
            'month': {
              '$month': '$orderedDate'
            },
            'year': {
              '$year': '$orderedDate'
            }
          }
        }, {
          '$match': {
            'month': query.month,
            'year': query.year
          }
        }, {
          '$lookup': {
            'from': 'accounts', 
            'localField': 'staffId', 
            'foreignField': 'staffId', 
            'as': 'staff'
          }
        }, {
          '$unwind': '$staff'
        }, {
          '$match': {
            'staff.workingShop': {
              '$in': query.shopList
            }
          }
        }, {
          '$unwind': '$itemList'
        }, {
          '$lookup': {
            'from': 'products', 
            'localField': 'itemList._id', 
            'foreignField': '_id', 
            'as': 'product'
          }
        }, {
          '$unwind': '$product'
        }, {
          '$project': {
            'shop': '$staff.workingShop', 
            'quantity': '$itemList.quantity', 
            'total': {
              '$multiply': [
                '$itemList.quantity', {
                  '$toDecimal': '$product.price'
                }
              ]
            }
          }
        }, {
          '$group': {
            '_id': '$shop', 
            'total': {
              '$sum': '$total'
            }, 
            'products': {
              '$push': '$$ROOT'
            }
          }
        }, {
          '$addFields': {
            'soldProduct': {
              '$sum': '$products.quantity'
            }
          }
        }, {
          '$lookup': {
            'from': 'shops', 
            'localField': '_id', 
            'foreignField': '_id', 
            'as': 'shop'
          }
        }, {
          '$unwind': '$shop'
        }, {
          '$project': {
            '_id': 0, 
            'name': '$shop.name', 
            'address': '$shop.address', 
            'total': 1, 
            'soldProduct': 1
          }
        }
      ], function(error, result) {
        if (error) {
          return response.json({exitcode:1, year: 0, month: 0, reports: [], message: error})
        }
        for (var i = 0; i < result.length; i++){
          result[i].total = result[i].total.toString(); 
        }
        response.json({exitcode: 200, year: query.year, month: query.month, reports: result, message: ''})
      })
    })
    .catch(err => {
      console('report_controller_err: ' + err);
      response.json({exitcode:1, year: 0, month: 0, reports: [], message: err});
    })
}
