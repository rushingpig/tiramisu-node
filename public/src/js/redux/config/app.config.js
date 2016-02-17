export default {
  root: '/',
  ajax: '/v1/a',
  // ajax: 'http://192.168.0.107:3001/v1/a',
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
  DELIVERY_TO_STORE: 'COLLECT', //门店自提
  DELIVERY_MAP: {
    'DELIVERY': '配送上门',
    'COLLECT': '门店自提',
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
    CANCEL : {value: '取消', key: -10, color: '#BDB8B8'},
    UNTREATED : {value: '未处理', key: 0, color: '#585353'},
    TREATED : {value: '已处理', key: 10, color: '#585353'},
    STATION : {value: '已分配配送站', key: 20, color: ''},
    CONVERT : {value: '已转换', key: 30, color: ''},
    INLINE : {value: '生产中', key: 40, color: ''},
    DELIVERY : {value: '已分配配送员', key: 50, color: ''},

    COMPLETED : {value: '订单完成', key: 100, color: '#0f0'},
    EXCEPTION : {value: '订单异常', key: 100, color: '#f00'}
  },
  pay_status: {
    'COD': '货到付款',
    'REFUNDING': '退款中',
    'REFUNDED': '已退款',
    'PAYED': '已付款',
    'PARTPAYED': '部分付款',
  },
  INVOICE: {
    YES: 1,
    NO: 0
  },
  YES_OR_NO: [{id: 1, text: '是'}, {id: 0, text: '否'}],

  PRINT_REVIEW_STATUS: {
    'UNAUDIT': '未审核',
    'AUDITED': '审核通过',
    'AUDITFAILED': '审核失败',
  },
  PRINT_STATUS: {
    'PRINTABLE': '是',
    'UNPRINTABLE': '否',
    'AUDITING': '否',
    'REPRINTABLE': '是',
  }

}