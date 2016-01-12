export default {
  root: '/',
  ajax: '/v1/a',

  SUCCESS_CODE: '0000',
  NO_MORE_CODE: '9998',

  SELECT_DEFAULT_VALUE: '-1',
  NAV_COLLAPSED_CLASS: 'left-side-collapsed',
  NAV_COLLAPSED_COOKIE: 'nav_collapsed_cookie', //保证菜单状态不随页面刷新而变化
  NAV_COLLAPSED_COOKIE_NO: 'no',
  NAV_COLLAPSED_COOKIE_YES: 'yes',

  DELIVERY_TO_HOME: 'DELIVERY', //配送上门
  DELIVERY_TO_STORE: 'TAKETHEIR', //门店自提
  DELIVERY_MAP: {
    'DELIVERY': '配送上门',
    'TAKETHEIR': '门店自提',
  },
  DELIVERY_TIME_MAP: [
    '09:00~10:00',
    '09:30~10:30',
    '10:00~11:00',
    '10:30~11:30',
    '11:00~12:00',
    '11:30~12:30',
    '12:00~13:00',
    '12:30~13:30',
    '13:00~14:00',
    '13:30~14:30',
    '14:00~15:00',
    '14:30~15:30',
    '15:00~16:00',
    '15:30~16:30',
    '16:00~17:00',
    '16:30~17:30',
    '17:00~18:00',
    '17:30~18:30',
    '18:00~19:00',
    '18:30~19:30',
    '19:00~20:00',
    '20:30~21:30',
    '21:00~22:00',
    '21:30~22:30',
    '22:00~23:00'
  ],

  pay_status: {
    'COD': '货到付款',
    'REFUNDING': '退款中',
    'REFUNDED': '已退款',
    'PAYED': '已付款'
  },
  INVOICE: {
    YES: 1,
    NO: 0
  },


}