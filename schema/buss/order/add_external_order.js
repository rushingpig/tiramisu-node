'use strict';
var constant = require('../../../common/Constant');

module.exports = {
  'delivery_type': {
    notEmpty: true,
    isIn: {
      options: [
        [constant.DT.TAKETHEIR, constant.DT.DELIVERY]
      ]
    }
  },
  'owner_name': {
    notEmpty: true
  },
  'owner_mobile': {
    notEmpty: true,
    // TODO: flexible matching for phone numbers
    isNumeric: true,
  },
  'recipient_name': {
    notEmpty: true
  },
  'recipient_mobile': {
    notEmpty: true,
    // TODO: flexible matching for phone numbers
    isNumeric: true,
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
    notEmpty: true
  },
  'delivery_time': {
    notEmpty: true
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
  // Optional
  'greeting_card': {
    optional: true
  },
  'recipient_landmark': {
    optional: true
  },
  'delivery_id': {
    optional: true
  },
  'remarks': {
    optional: true
  },
};
