'use strict';
var path = require('path');
var fs = require('fs');
var pool = require('../../dao/base_dao').pool;

function DBInitMiddleware() {}

function loadSQL() {
  const filePaths = [
    '../../sql/tiramisu.sql',
    '../../sql/iteration.sql'
  ];
  const sql = [];
  filePaths.forEach(filePath => {
    sql.push(
      fs.readFileSync(
        path.join(__dirname, filePath),
        {
          flag: 'rs',
          encoding: 'utf-8'
        }
      )
    );
  });
  return sql.join('\n');
}

DBInitMiddleware.initdb = (callback) => {
  callback = callback || function () {};
  if (['dev', 'production', 'test'].indexOf(process.env.NODE_ENV) === -1) {
    pool.query(
      loadSQL(),
      (err) => {
        if (err) {
          console.error(err);
          console.error('=============================================');
          console.error('==============init db failed=================');
          console.error('=============================================');
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
