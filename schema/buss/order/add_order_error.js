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
  'type': {
    notEmpty: true,
    isIn: {
      options: [Object.keys(constant.BUSS_ORDER_ERROR.TYPE)]
    }
  },
  'detail': {
    notEmpty: true
  }
};
