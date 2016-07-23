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

const OS = Constant.OS;

module.exports = {
  /**
   * wrap the service promise for catch error
   * @param next
   * @param promise
   */
  wrapService: (res, next, promise,cb) => {
    promise.catch((err) => {
      if (err instanceof TiramisuError) {
        if (err.getResObj() === res_obj.FAIL) {
          res.status(500);
        }
        res.api(err.getResObj(), err.getMsg());
      } else {
        next(err);
      }
      if(cb && typeof cb === 'function'){
        cb(err);
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
      logger.error('the order_id [', showOrderId, '] to be convert into db order_id is not valid...');
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
    if (req.session && req.session.user) {
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
      // logger.warn('the object to be encode is not valid string ...');
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
    return !(
      order_status === Constant.OS.INLINE ||
      order_status === Constant.OS.DELIVERY ||
      order_status === Constant.OS.COMPLETED ||
      order_status === Constant.OS.EXCEPTION);
  },
  isOrderCanException : (order_status) => {
    return !module.exports.isOrderCanCancel(order_status);
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
    // TODO(pigo): req.session sometimes will be undefined
    req.session = req.session || {};
    let userInfo = req.session.user;
    let user = {};
    if (userInfo) {
      user = {
        username : userInfo.username,
        name: userInfo.name,
        permissions: userInfo.permissions,
        is_admin : userInfo.is_admin
      };
    }
    res.render('index', {isLogin: userInfo ? true : false, user: JSON.stringify(user),version : version});
  },
  isToFilterDeliverymans : (user) => {
    return !user.is_admin &&
        (
          user.data_scopes.indexOf(constant.DS.STATION.id) !== -1
          || user.data_scopes.indexOf(constant.DS.CITY.id) !== -1
        );
  },
  isDoDataFilter : (query_data) => {
    return query_data && !(query_data.user.is_admin || query_data.user.data_scopes.indexOf(Constant.DS.ALLCOMPANY.id) != -1);
  },
  isDoOrderDataFilter: (query_data)=> {
    if(!query_data) query_data = {};
    if(!query_data.user) query_data.user = {};
    let data_scopes = query_data.user.data_scopes || [];
    return !(query_data.user.is_admin ||
    (query_data.user.is_headquarters && data_scopes.indexOf(constant.DS.CITY.id) !== -1) ||
    (query_data.user.is_all_src && data_scopes.indexOf(constant.DS.SELF_CHANNEL.id) !== -1));
  },
  isDoUserDataFilter: (query_data)=> {
    if(!query_data) query_data = {};
    if(!query_data.user) query_data.user = {};
    let data_scopes = query_data.user.data_scopes || [];
    return !(query_data.user.is_admin ||
    (data_scopes.indexOf(constant.DS.ALLCOMPANY.id) !== -1) ||
    (query_data.user.is_all_org && data_scopes.indexOf(constant.DS.OFFICEANDCHILD.id) !== -1));
  },
  addLastOptCs: (order_obj, req)=> {
    if(req.session.user.role_ids.indexOf(constant.CS_MAN_ID) != -1){
      order_obj.last_opt_cs = req.session.user.id;
    }
  },
  isOrderCanUpdateStatus: (curr_status, new_status)=> {
    let result;
    switch (curr_status) {
      case OS.UNTREATED:  // 未处理
        result = [OS.CANCEL, OS.UNTREATED, OS.TREATED, OS.STATION].indexOf(new_status);
        break;
      case OS.TREATED:  // 已处理
        result = [OS.CANCEL, OS.TREATED, OS.STATION].indexOf(new_status);
        break;
      case OS.STATION:  // 已分配配送站
        result = [OS.CANCEL, OS.STATION, OS.CONVERT].indexOf(new_status);
        break;
      case OS.CONVERT:  // 已转换
        result = [OS.CANCEL, OS.INLINE, OS.STATION].indexOf(new_status);
        break;
      case OS.INLINE:  // 生产中
        result = [OS.EXCEPTION, OS.DELIVERY].indexOf(new_status);
        break;
      case OS.DELIVERY:  // 已分配配送员
        result = [OS.EXCEPTION, OS.COMPLETED].indexOf(new_status);
        break;
      case OS.CANCEL:
      case OS.COMPLETED:
      case OS.EXCEPTION:
        return false;
        break;
    }
    return (result !== undefined && result !== -1);
  }
};