"use strict";

module.exports = require('./qa');

//  mysql config options
module.exports.mysql_options.database = 'tiramisu_pr';
var mysql_options = module.exports.mysql_options;

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
