export default {
  root: '/',
  ajax: '/v1/a',
  REQUEST: {
    ING: 0,
    SUCCESS: 1,
    FAIL: 2
  },

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

  order_status: {
    CANCEL : {value: '取消', bg: '#f0f'},
    UNTREATED : {value: '未处理', bg: '#f0f'},
    STATION : {value: '已分配配送站', bg: '#f0f'},
    CONVERT : {value: '已转换', bg: '#f0f'},
    INLINE : {value: '生产中', bg: '#f0f'},
    DELIVERY : {value: '已分配配送员', bg: '#f0f'},
    COMPLETED : {value: '订单完成', bg: '#f0f'},
    EXCEPTION : {value: '订单异常', bg: '#f0f'}
  },
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

  PRINT_REVIEW_STATUS: {
    'UNAUDIT': '未审核',
    'AUDITED': '审核通过',
    'AUDITFAILED': '审核失败',
  }

}