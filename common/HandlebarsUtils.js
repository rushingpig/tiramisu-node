/**
 * @des    : the utils module for handlebars tempalte engine
 * @author : pigo.can
 * @date   : 16/1/15 上午11:50
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var logger = require('./LogHelper').systemLog();
function HandlebarsUtils(){

}

HandlebarsUtils.instance = function(express_handlebars){
    if(!express_handlebars){
        logger.error('the object',express_handlebars,' for create handlebars instance is invalid...');
        throw new Error('invalid object');
    }
    return express_handlebars.create(HandlebarsUtils.config);
};

HandlebarsUtils.config = {
    defaultLayout : false,
    helpers : {
        add : function(num1,num2){
            return num1 + num2;
        }
    }
};

module.exports = HandlebarsUtils;