/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/7 下午5:13
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";

var Sequelize = require('sequelize');
var db = require('../config').db;

function DBFactory(dialect){
    this.dialect = dialect;
}

DBFactory.prototype.toString = function(){
    return 'the factory of dialet -> ' + this.dialect;
}

DBFactory.getInstance = function(){
    const sequelize = new Sequelize(db.database,db.username,db.password,db.props);
    return sequelize;
};

module.exports = DBFactory;
module.exports.Sequelize = Sequelize;
