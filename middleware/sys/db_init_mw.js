/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/10 下午6:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var path = require('path');
var fs = require('fs');
var pool = require('../../dao/base_dao').pool;

function DBInitMiddleware(){

}
/**
 * private
 * @constructor
 */
function loadSQL(){
    let filePath = path.join(__dirname,'../../sql/tiramisu.sql');
    var sql = fs.readFileSync(filePath,{
        flag : 'rs',
        encoding : 'utf-8'
    });
    return sql;

}


DBInitMiddleware.initdb = ()=>{
    if(process.env.tiramisu_env !== 'production'){
        pool.getConnection((err,conn)=> {
            conn.query(loadSQL(), (err)=> {
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
            });
        });
    }
    return;
}

module.exports = DBInitMiddleware;
