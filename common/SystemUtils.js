'use strict';
var dateUtils = require('./DateUtils'),
  TiramisuError = require('../error/tiramisu_error'),
  toolUtils = require('./ToolUtils'),
  IncomingMessage = require('http').IncomingMessage,
  logger = require('./LogHelper').systemLog(),
  Constant = require('./Constant'),
  res_obj = require('../util/res_obj'),
  geolib = require('geolib'),
  version = require('../package.json').version,
  constant = require('./Constant');

module.exports = {
  /**
   * wrap the service promise for catch error
   * @param next
   * @param promise
   */
  wrapService: (res, next, promise) => {
    promise.catch((err) => {
      if (err instanceof TiramisuError) {
        if (err.getResObj() === res_obj.FAIL) {
          res.status(500);
        }
        res.api(err.getResObj(), err.getMsg());
      } else {
        next(err);
      }
    });
  },
  /**
   * get the order id for display
   * @param id
   * @param date
   */
  getShowOrderId: (id, date) => {
    if (!Number.isInteger(id)) {
      throw new Error('the id must be an integer...');
    }
    return dateUtils.format(date, 'YYYYMMDD') + id.toString();
  },
  /**
   * get the order id in db by the display order id
   * @param showOrderId
   * @returns {string}
   */
  getDBOrderId: (showOrderId) => {
    if (!showOrderId || typeof showOrderId !== 'string' || showOrderId.length < 16) {
      logger.error('the order_id [', showOrderId, '] to be convert into db order_id is not valid...')
      throw new Error('the order_id [' + showOrderId + '] for display to convert must be an valid string...');
    }
    return showOrderId.substring(8);
  },
  assembleInsertObj: (req, obj, ignoreUpdatedTime) => {
    if (!(req instanceof IncomingMessage)) {
      logger.error('the req object[' + req + 'must be the instance of IncomingMessage...');
      throw new Error('the req object[' + req + 'must be the instance of IncomingMessage...');
    }
    if (toolUtils.isEmptyObject(obj)) {
      logger.error('the obj[ ' + obj + ']to be assemble for update should be an instance of object and has it\'s own property...');
      throw new Error('the obj[ ' + obj + ']to be assemble for update should be an instance of object and has it\'s own property...');
    }
    if (req.session.user) {
      // If we are a login user, update the created_by value to the user_id
      obj.created_by = req.session.user.id;
    }
    obj.created_time = new Date();
    if (!ignoreUpdatedTime) {
      obj.updated_time = new Date();
    }
    return obj;
  },
  assembleUpdateObj: (req, obj) => {
    if (!(req instanceof IncomingMessage)) {
      logger.error('the req object[' + req + 'must be the instance of IncomingMessage...');
      throw new Error('the req object[' + req + 'must be the instance of IncomingMessage...');
    }
    if (toolUtils.isEmptyObject(obj)) {
      logger.error('the obj[ ' + obj + ']to be assemble for update should be an instance of object and has it\'s own property...');
      throw new Error('the obj[ ' + obj + ']to be assemble for update should be an instance of object and has it\'s own property...');
    }
    obj.updated_by = req.session.user.id;
    obj.updated_time = new Date();
    // the updated_time is update by db self ==> on update CURRENT_TIMESTAMP
    return obj;
  },
  assemblePaginationObj: (req, obj) => {
    if (!(req instanceof IncomingMessage)) {
      logger.error('the req object[' + req + 'must be the instance of IncomingMessage...');
      throw new Error('the req object[' + req + 'must be the instance of IncomingMessage...');
    }
    if (toolUtils.isEmptyObject(obj)) {
      throw new Error('the obj param should be an instance of object and has it\'s own property...');
    }
    obj.page_no = req.query.page_no;
    obj.page_size = req.query.page_size;
    return obj;
  },
  encodeForFulltext: (obj) => {
    let str = '';
    if (!obj || typeof obj !== 'string' || obj.length === 0) {
      logger.warn('the object to be encode is not valid string ...');
    } else {
      obj = obj.replace(toolUtils.SPECIAL_CHAR_REG,'');
      for (let i = 0; i < obj.length; i++) {
        let curr_char = obj.charAt(i);
        if(toolUtils.isAlphaNumeric(curr_char)){
          str += curr_char;
          continue;
        }
        try{
          str += (' '+encodeURIComponent(curr_char).replace(/%/g, '') + ' ');
        }catch(e){
          logger.warn('encode the obj['+obj+']exception',e);
        }

      }
    }
    return str;
  },
  genValidateCode: (code_length) => {
    code_length = code_length || 6;
    let code = Math.floor(Math.random() * Math.pow(10, code_length));
    for (let i = 0; i < code_length - code.toString().length;) {
      code = code.toString() + '0';
    }
    return code.toString();
  },
  isOrderCanCancel: (order_status) => {
    return !(order_status === Constant.OS.INLINE
      || order_status === Constant.OS.DELIVERY
      || order_status === Constant.OS.COMPLETED
      || order_status === Constant.OS.EXCEPTION);
  },
  isOrderCanException : (order_status) => {
    return module.exports.isOrderCanCancel(order_status);
  },
  //  是否在配送范围内
  isInDeliveryScope: (lng, lat, coords) => {
    let point = { latitude: lat, longitude: lng };
    if (toolUtils.isEmptyArray(coords)) {
      return false;
    }
    return geolib.isPointInside(point, coords);
  },
  commonRender : (req,res) => {
    let userInfo = req.session.user, user;
    if (userInfo) {
      user = {
        name: userInfo.name,
        permissions: userInfo.permissions
      };
    }
    res.render('index', {isLogin: userInfo ? true : false, user: JSON.stringify(user),version : version});
  },
  isToFilterDeliverymans : (user) => {
    return !user.is_admin &&
        (
          user.data_scopes.indexOf(constant.DS.STATION) !== -1
          || user.data_scopes.indexOf(constant.DS.CITY) !== -1
        );
  }

};