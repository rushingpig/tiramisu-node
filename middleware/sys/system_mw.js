'use strict';
var clone = require('clone');
var res_obj = require('../../util/res_obj');
var toolUtils = require('../../common/ToolUtils');
var logger = require('../../common/LogHelper').systemLog();

function SystemMiddleware(type) {
  this.type = type;
}

const tiramisu_env = process.env.NODE_ENV;
const debug_arr = ['dev', 'development','qa','test'];
const always_debug_req = true;

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
      res.renders = function (tplName, data, cb) {
        res.set('Content-Type', 'text/html');
        res.render(tplName, data, cb);
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

    if (always_debug_req || !tiramisu_env || debug_arr.indexOf(tiramisu_env) !== -1) {
      let user_id = (req.session && req.session.user && req.session.user.id) ? req.session.user.id : 0;
      logger.info('[%s] %s %s', user_id, req.method.toUpperCase(), req.originalUrl);
      logger.info('******************** 请༗求༗参༗数༗ **********************');
      if ('get' === req.method.toLowerCase()) {
        if (!toolUtils.isEmptyObject(req.params)) {
          logger.info('params -> \n', req.params);
        }
        if (!toolUtils.isEmptyObject(req.query)) {
          logger.info('query -> \n', req.query);
        }
      } else {
        logger.info('body -> \n', JSON.stringify(req.body, null, 2));
      }
      logger.info('********************************************************\n');
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
  return function (res_tpl, data, err) {
    let temp = {
      code: '',
      msg: '',
      data: {},
      err: ''
    };
    try {
      if (data === undefined) {
        temp = clone(res_obj.OK);
        temp.data = res_tpl || {};
      } else if (err === undefined && arguments.length === 2) {
        temp = clone(res_tpl);
        temp.data = temp.data || {};
        temp.err = data || '';
      } else {
        temp = clone(res_tpl);
        temp.data = data || {};
        temp.err = err || '';
      }
      if (!tiramisu_env || debug_arr.indexOf(tiramisu_env) !== -1) {
        logger.info('******************** 返༗回༗参༗数༗ **********************');
        logger.info(JSON.stringify(temp,null,2));
        logger.info('********************************************************\n');
      }
      return res.json(temp);
    } catch (err) {
      temp = clone(res_obj.FAIL);
      temp.data = {};
      return res.json(temp);
    }
  };
}


module.exports = new SystemMiddleware();
module.exports.SystemMiddleware = SystemMiddleware;