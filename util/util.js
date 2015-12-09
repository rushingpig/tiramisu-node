'use strict';
var moment = require('moment');

var util = {};

util.checkMissingBodyProperties = function (params) {
  return function (req, res, next) {
    let missingParams = [];
    params.forEach(function (name) {
      if (!req.body.hasOwnProperty(name)) {
        missingParams.push(name);
      }
    });
    if (missingParams.length > 0) {
      res.status(400).json({error: 1, message: `missing properties in body: ${missingParams.join(', ')}`});
    } else {
      next();
    }
  };
}

/*
transfrom the unix timestamp to moment object.
*/
util.transformTimestamp = function (req, res, next) {
  let date = moment.unix(req.body.timestamp);
  if (!date.isValid()) {
    res.status(400).json({error: 2, message: `invalid timestamp: ${req.body.timestamp}`});
  } else {
    req.body.date = date;
    next();
  }
}

util.vanllilaQueryErrorHandler = function (err, rows, ignore2) {
  if (err) {console.error(err.message + rows.length);}
}

module.exports = util;
