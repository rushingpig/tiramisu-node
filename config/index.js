/**
 * @des    : 配置入口文件统一管理
 * @author : pigo.can
 * @date   : 15/12/2 上午10:03
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";

function config_index(){
    let config;
    let tiramisu_env = process.env.tiramisu_env;
    if('test' === tiramisu_env){
        config = require('./test');
    }else if('production' === tiramisu_env){
        config = require('./production');
    }else{
        config = require('./dev');
    }

    module.exports = config;
}

config_index();
