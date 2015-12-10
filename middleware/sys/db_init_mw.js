/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/10 下午6:31
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var sql = require('../../sql');
var pool = require('../../dao/base_dao').pool;

function DBInitMiddleware(){

}

DBInitMiddleware.initdb = ()=>{
    if(process.env.tiramisu_env !== 'production'){
        pool.getConnection((err,conn)=> {
            conn.query(sql, (err)=> {
                if (err) {
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
}

module.exports = DBInitMiddleware;
