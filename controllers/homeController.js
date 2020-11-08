'use strict'

const config = require('../config');

module.exports = {
  getView: getView
}

var MongooseConnect = require('../lib/MongoConnect.js'),
    Models = require('../models');

function getView(request, response) {
  if (request.session.user){
    response.render('home', { page: "home", user: request.session.user });
  }
  else {
    response.redirect('/login');
  }
}
