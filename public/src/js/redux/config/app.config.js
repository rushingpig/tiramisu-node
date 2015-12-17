export default {
  root: '/',
  ajax: '/v1/a',

  success_code: '0000',

  DISTRIBUTE_TO_HOME: 'TAKETHEIR', //配送上门
  DISTRIBUTE_TO_STORE: 'DELIVERY', //门店自提

  pay_status: {
    'COD': '货到付款',
    'REFUNDING': '退款中',
    'REFUNDED': '已退款',
    'PAYED': '已付款'
  },
  INVOICE: {
    YES: 1,
    NO: 0
  }
}