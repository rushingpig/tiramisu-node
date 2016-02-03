'use strict';
var path = require('path');
var fs = require('fs');
var pool = require('../../dao/base_dao').pool;

function DBInitMiddleware() {}

function loadSQL() {
  let filePath = path.join(__dirname, '../../sql/tiramisu.sql');
  let sql = fs.readFileSync(filePath, {
    flag: 'rs',
    encoding: 'utf-8'
  });
  return sql;
}

DBInitMiddleware.initdb = (callback) => {
  callback = callback || function () {};
  if (['dev', 'production', 'test'].indexOf(process.env.NODE_ENV) === -1) {
    pool.query(
      loadSQL(),
      (err) => {
        if (err) {
          console.log(err);
          console.log('=============================================');
          console.log('==============init db failed=================');
          console.log('=============================================');
        } else {
          console.log('==============================================');
          console.log('==============init db success=================');
          console.log('==============================================');
        }
        callback();
    });
  }
};

module.exports = DBInitMiddleware;
