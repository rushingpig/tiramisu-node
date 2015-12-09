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
/**
 * get client ip
 * @param req
 * @returns {*|string}
 */
util.getClientIP=function(req) {
  let ip = req.headers['X-FORWARDED-FOR'] ||
      req.headers['X-Real-IP'] ||
      req.headers['Proxy-Client-IP'] ||
      req.headers['WL-Proxy-Client-IP'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '0.0.0.0';
  return ip.split(':').pop();
};


module.exports = util;
