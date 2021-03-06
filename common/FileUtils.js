/**
 * @des    : 文件操作工具类
 * @author : pigo.can
 * @date   : 15/12/2 上午11:16
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var path = require('path');
var fs = require('fs');

function FileUtils(){}

FileUtils.autoRequireModules = function(){

};

FileUtils.getAvailModuleNames = (function getAvailModuleNames(filePath){
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
/*
var stream = require('stream')
var liner = new stream.Transform( { objectMode: true } )

liner._transform = function (chunk, encoding, done) {
    var data = chunk.toString()
    if (this._lastLineData) data = this._lastLineData + data

    var lines = data.split('\n')
    this._lastLineData = lines.splice(lines.length-1,1)[0]

    lines.forEach(this.push.bind(this))
    done()
}

liner._flush = function (done) {
    if (this._lastLineData) this.push(this._lastLineData)
    this._lastLineData = null
    done()
}

module.exports = liner
 */

FileUtils.autoRequireRouter =  (function f(filePath,router) {
    let stat = fs.statSync(filePath);
    if(stat.isDirectory()){
        let files = fs.readdirSync(filePath);
        files.forEach((curr)=>{
            f(filePath+path.sep+curr,router);
        });
    }else if(stat.isFile()){
        require(filePath)(router);
    }
});
module.exports = FileUtils;







