'use strict'

const config = require('../config');

module.exports = {
  getView: getView,
  authenticate: authenticate,
  logout: logout
}

var MongooseConnect = require('../lib/MongoConnect.js'),
    Models = require('../models');

function getView(request, response) {
  response.render('login', { exitcode: 200, message: '' });
}

function authenticate(request, response) {
  var query = {
    username: request.body.username.toLowerCase().trim(),
    password: request.body.password
  }
  if ("" == query.username || undefined == query.username){
    return response.render('login', { exitcode: 1, message: 'Username is empty' });
  }
  if ("" == query.password || undefined == query.password) {
    return response.render('login', { exitcode: 1, message: 'Password is empty'});
  }
  MongooseConnect.Connect(config.database.name)
    .then(db => {
      Models.accountModel.aggregate([{ $match: query }, {$project: {password: 0, __v: 0}}, { $lookup: {from: "shops", localField: "workingShop", foreignField: "_id", as: "workingShop"}}, { $unwind: {path:"$workingShop", preserveNullAndEmptyArrays: true}}],
      function(error, result) {
        if (error) {
          return response.render('login', {exitcode: 1, message: error});
        }

        if (result.length > 0) {
          request.session.user = result[0];
          response.redirect("/");
        }
        else {
          response.render('login', {exitcode: 404, message: "Username or password is incorrect"});
        }
      })
    })
    .catch(err => {
      console.log('login_controller_authenticate: ' + err);
      response.render('login', {exitcode: 512, message: "Cannot connect to the database"});
    })
}

function logout(request, response) {
  delete request.session.user;
  response.redirect('/login');
}
