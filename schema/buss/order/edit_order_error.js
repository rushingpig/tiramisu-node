'use strict';
var constant = require('../../../common/Constant');

module.exports = {
  'merchant_id': {
    notEmpty: true
  },
  'src_id': {
    notEmpty: true,
    isNumeric: true
  },
  'status': {
    notEmpty: true,
    isIn: {
      options: [Object.keys(constant.BUSS_ORDER_ERROR.STATUS)]
    }
  }
};
