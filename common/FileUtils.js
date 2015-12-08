/**
 * @des    : 文件操作工具类
 * @author : pigo.can
 * @date   : 15/12/2 上午11:16
 * @email  : rushingpig@163.com
 * @version: v1.0
 */

//TODO:根据不同的文件名加载不同的模块
"use strict";
var path = require('path');
var fs = require('fs');

function FileUtils(){}

FileUtils.autoRequireModules = function(){

};

FileUtils.prototype.getAvailModuleNames = (function getAvailModuleNames(filePath){
    var fileStats = fs.lstatSync(filePath);
    if(fileStats.isDirectory()){
        var filess = fs.readdirSync(filePath);
        filess.forEach(function(curr,index,arr){
            getAvailModuleNames(filePath+path.sep+curr)
        });
    }else if(fileStats.isFile() && path.extname(filePath) === '.js'){
        filePath.substring(filePath.lastIndexOf('/')+1);
    }
});






