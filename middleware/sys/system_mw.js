/**
 * @des    : wrap the response of express (an instance of http.ServerResponse)
 * @author : pigo.can
 * @date   : 15/12/9 下午1:17
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v1.0
 */
"use strict";
var clone = require('clone');
var res_obj = require('../../util/res_obj'),
    toolUtils = require('../../common/ToolUtils');

function SystemMiddleware(type) {
    this.type = type;
}

SystemMiddleware.prototype = {
    // intercept and wrap the ServerResponse instance
    wrapperResponse: function (req, res, next) {
        if (res) {
            res.sendJson = function (body) {
                res.json(body);
            };
            res.sendHtml = function (html) {
                res.set('Content-Type', 'text/html');
                res.send(html);
            };
            res.renders = function (tplName,data,cb) {
                res.set('Content-Type', 'text/html');
                res.render(tplName,data,cb);
            };
            res.sendText = function (text) {
                res.set('Content-Type', 'text/plain');
                res.send(text);
            };
            res.api = api(res);
            next();
        } else {
            next(new Error('The res instance should not be empty...'));
        }
    },
    debugReqAndResParams: function (req, res, next) {
        let tiramisu_env = process.env.NODE_ENV;
        if (!tiramisu_env || 'dev' === tiramisu_env || 'development' === tiramisu_env) {
            console.log('******************** 请༗求༗参༗数༗ **********************');
            let requestMethod = req.method.toLowerCase();
            if ('get' === requestMethod) {
                let query_or_params = toolUtils.isEmptyObject(req.query) ? req.params : req.query;
                console.log('query/params -> \n', query_or_params);
            } else {
                console.log('body -> \n', JSON.stringify(req.body, null, 2));
            }
            console.log('********************************************************\n');
        }
        next();
    }
};
/**
 * <b>
 *     <li>if the res code is not normal (!'0000'),then you call the method should carry two arguments</li>
 *     <li>
 *         <ul>else if the res code is normal and you just want to padding the data,you can do these :
 *              <li>one argument -> data</li>
 *              <li>two arguments - > res_obj.key , data</li>
 *              <li>no arguments</li>
 *     </li>
 * </b>
 * @param res
 * @returns {Function}
 */
function api(res) {
    return function(res_tpl, data,err){     // in order to use arguments,do not use [=>] to instead of [function] keyword
        let temp = {
            code : '',
            msg  : '',
            data : {},
            err : ''
        };
        try {
            if(data === undefined){
                temp = clone(res_obj.OK);
                temp.data = res_tpl || {};
            }else if(err === undefined && arguments.length === 2){
                temp = clone(res_tpl);
                temp.data = {};
                temp.err = data || '';
            }else{
                temp = clone(res_tpl);
                temp.data = data || {};
                temp.err = err || '';
            }
            return res.json(temp);
        } catch (err) {
            temp = clone(res_obj.FAIL);
            temp.data = {};
            return res.json(temp)
        }
    };
}


module.exports = new SystemMiddleware();
module.exports.SystemMiddleware = SystemMiddleware;