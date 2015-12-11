/**
 * @des    : deprecated
 * @author : pigo.can
 * @date   : 15/12/7 下午5:01
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";

var DBFactory = require('./DBFactory');
var Sequelize = DBFactory.Sequelize;
var db = DBFactory.getInstance();
var dba = DBUtils;

function DBUtils(){

}
// db DDL
dba.create = function(){
    db.define('project',{
        title : Sequelize.STRING,
        description : Sequelize.TEXT
    },{
        freezeTableName: true // Model tableName will be the same as the model name
    });
    db.sync({force:true}).then(function(){
        console.log('it works');
        db.create()
    });
};

dba.select = function(sql,params,cb){

};

dba.insert = function(){
    db.query('insert into projects(title,description,createdAt,updatedAt) values (:title,:description,:createAt,:updateAt)',{
        replacements : {title:'hehe',description:'haha',createAt:new Date(),updateAt:new Date()}
    }).spread(function(results,metadata){
        console.log('=========', metadata.affectedRows);
    });
}

//dba.create();
dba.insert();
module.exports = DBUtils;