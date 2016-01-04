/**
 * @des    : 配置入口文件统一管理
 * @author : pigo.can
 * @date   : 15/12/2 上午10:03
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var fs = require('fs'),
    path = require('path');

function config_index() {
    let localConfigFilePath = path.join(__dirname + path.sep + 'local.js'),
        config, fileStats,
        tiramisu_env = process.env.NODE_ENV;

    if (!tiramisu_env || 'development' === tiramisu_env || 'dev' === tiramisu_env) {
        try {
            fileStats = fs.statSync(localConfigFilePath);
        } catch (err) {
            console.log('*************** there is no file local.js,will load the special config file **************');
        }finally{
            if(fileStats && fileStats.isFile()){
                config = Object.assign(require('./dev'),require('./local'));
            }else{
                config = require('./dev');
            }
        }
    }else if ('test' === tiramisu_env) {
        config = require('./test');
    } else if ('production' === tiramisu_env) {
        config = require('./production');
    } else{
        throw new Error('please set the param : NODE_ENV in you PATH....');
    }

    module.exports = config;
}

config_index();

