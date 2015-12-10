/**
 * @des    : wrap the response of express (an instance of http.ServerResponse)
 * @author : pigo.can
 * @date   : 15/12/9 下午1:17
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
function SystemMiddleware(type){
    this.type = type;
}

SystemMiddleware.prototype = {
    wrapperResponse : function(req,res,next){
        if(res){
            res.sendJson = function(body){
                res.json(body);
            };
            res.sendHtml = function(html){
                res.set('Content-Type','text/html');
                res.send(html);
            };
            res.renders = function(tplName){
                res.set('Content-Type','text/html');
                res.render(tplName);
            };
            res.sendText = function(text){
                res.set('Content-Type','text/plain');
                res.send(text);
            }
            next();
        }else{
            throw new Error('The res instance should not be empty...');
        }
    },
};

module.exports = new SystemMiddleware();
module.exports.SystemMiddleware = SystemMiddleware;