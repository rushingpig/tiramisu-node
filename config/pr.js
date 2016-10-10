"use strict";

module.exports = require('./qa');

let mysql_options = module.exports.mysql_options;

module.exports.backup_host = 'http://localhost:4001';

module.exports.mongodb_uri = 'mongodb://tiramisu_qa:2VMIfXEdACzj@10.46.89.45:27017/tiramisu';
module.exports.mongodb_backup_schema_name = 'order';

//  mysql config options
module.exports.mysql_options = {
  acquireTimeout: 10000,
  waitForConnections: true,
  queueLimit: 500,
  connectionLimit: 50,
  host: 'rdsp4y4r841mswksag22.mysql.rds.aliyuncs.com',
  port: 3306,
  user: 'xfxb_qa',
  password: 'Xfxbqa2016',
  database: 'tiramisu_pr',
  charset: 'utf8mb4',
  timezone: 'local',
  supportBigNumbers: true,
  multipleStatements: true, //  if in the production recommend to be false
  dateStrings: true, //  Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather then inflated into JavaScript Date objects.
  debug: false, //  when in production or test environment ,it should be set to false. it just be used in dev

};

//  express session config options
module.exports.exp_session_options = function (store) {
    return {
        secret: 'tiramisu cake',
        resave: true,
        saveUninitialized: false,
        name: 'tiramisu.sid',
        unset: 'keep',
        store: new store({
            host: mysql_options.host,
            port: mysql_options.port,
            user: mysql_options.user,
            password: mysql_options.password,
            database: mysql_options.database,
            checkExpirationInterval: 60000,
            expiration: 360000000,
            createDatabaseTable: true,
            schema: {
                tableName: 'sys_user_session',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data'
                }
            }
        }),
        cookie: {
            secure: false
        }
    };
};
