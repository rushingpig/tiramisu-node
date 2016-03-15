'use strict';
var constant = require('../../../common/Constant');

module.exports = {
  'delivery_type': {
    notEmpty: true,
    isIn: {
      options: [
        [constant.DT.COLLECT, constant.DT.DELIVERY]
      ]
    }
  },
  'owner_name': {
    notEmpty: true
  },
  'owner_mobile': {
    notEmpty: true,
    matches: {
      options: [/^[0-9\*]+$/]
    }
  },
  'recipient_name': {
    notEmpty: true
  },
  'recipient_mobile': {
    notEmpty: true,
    matches: {
      options: [/^[0-9\*]+$/]
    }
  },
  'regionalism_id': {
    notEmpty: true,
    isInt: true
  },
  'recipient_address': {
    notEmpty: true
  },
  'src_id': {
    notEmpty: true,
    isInt: true
  },
  'pay_modes_id': {
    notEmpty: true,
    isInt: true
  },
  'pay_status': {
    notEmpty: true,
    isIn: {
      options: [
        ['COD', 'PAYED']
      ]
    }
  },
  'delivery_time': {
    optional: true,
    matches: {
      options: [/\d{4}-\d{2}-\d{2} \d{2}:\d{2}~\d{2}:\d{2}/],
      errorMessage: 'Sample: 2016-01-18 19:30~20:30'
    }
  },
  'total_amount': {
    notEmpty: true,
    isFloat: true
  },
  'total_original_price': {
    notEmpty: true,
    isFloat: true
  },
  'total_discount_price': {
    notEmpty: true,
    isFloat: true
  },
  'merchant_id': {
    notEmpty: true
  },
  // Optional
  'greeting_card': {
    optional: true
  },
  'recipient_landmark': {
    optional: true
  },
  'remarks': {
    optional: true
  },
  'coupon': {
    optional: true,
    notEmpty: true
    /*
    matches: {
      options: [/^[0-9]+$/]
    }
    */
  }
};
