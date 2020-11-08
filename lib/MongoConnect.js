'use strict'

const config = require('../config');
var mongoose = require('mongoose');

var db;

module.exports = {
  Connect: connect,
  ToObjectId: toObjectId
}

function connect(dbName){
  return new Promise(function (resolve, reject) {
    if (db) {
      if (db.name == dbName){
        resolve(db);
        return;
      } else {
        console.log(`Close database [${db.name}]`);
        db.close();
      }
    }
    mongoose.Promise = global.Promise;

    //Create connection string
    var connectionString = '';
    if (config.database.username == '' || config.database.password == '') {
      connectionString = 'mongodb://' + config.database.host + ':' + config.database.port
                          + '/' + dbName + config.database.optional;
    } else {
      connectionString = 'mongodb+srv://' + config.database.username + ':' + config.database.password
                          + '@' + config.database.host
                          + '/' + dbName + config.database.optional;
    }
    //Connect to database
    mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(() => {
        db = mongoose.connection;
        resolve(db);
        return;
      })
      .catch(err => {
        console.log(`Error creating MongoDB connection ${err}`);
        reject(err);
      })
  })
}

function toObjectId(string){
  return mongoose.Types.ObjectId(string);
}
