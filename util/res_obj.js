'use strict';

module.exports = {
  // TODO: increase the verbosity
  OK: {
    code: '0000',
    msg: 'everything goes well -> enjoy yourself...'
  },
  INVALID_USERNAME_OR_PASSWORD: {
    code: '1000',
    msg: '用户名或密码输入有误,请重新输入...'
  },
  SESSION_TIME_OUT: {
    code: '1001',
    msg: '长时间未操作,请重新登录...'
  },
  ERROR_VALIDATE_CODE: {
    code: '1002',
    msg: '验证码输入有误,请重新输入...'
  },
  ORDER_AUDITING: {
    code: '2000',
    msg: '有订单打印正在审核中,请等待审核通过...'
  },
  ORDER_NO_PRINT: {
    code: '2001',
    msg: '有订单打印不被允许,请重新申请打印...'
  },
  ORDER_COMPLETED: {
    code: '2002',
    msg: '订单已签收,请勿重复签收...'
  },
  ORDER_EXCEPTION: {
    code: '2003',
    msg: '订单已被未签收,请勿重复签收...'
  },
  ORDER_NO_STATION: {
    code: '2004',
    msg: '订单不处于分配配送站状态,不能被转换...'
  },
  ORDER_CANNOT_CANCEL: {
    code: '2005',
    msg: '订单已生产或配送中,不能取消...'
  },
  ORDER_NO_PRODUCT: {
    code: '2006',
    msg: '订单没有产品,请添加产品...'
  },
  NO_DELIVERYMAN : {
    code : '2009',
    msg : '没有分配配送员,不能直接打印...'
  },
  ORDER_CANNOT_EXCEPTION: {
    code: '2010',
    msg: '订单还未进入生产状态,不能被置为异常...'
  },
  INVALID_ORDER_SRC_PARENT_ID: {
    code: '2011',
    msg: '无效的一级来源渠道id...'
  },
  NO_OPTIONAL_STATION: {
    code: '3001',
    msg: '没有可选的配送站...'
  },
  NO_WHITE_LIST_IP: {
    code: '9994',
    msg: 'the client ip is not in the white list ...'
  },
  NO_MORE_PAGE_RESULTS: {
    code: '9998',
    msg: 'no more results...',
    data: {
      list: [],
      total: 0
    },
    page_no: -1
  },
  OPTION_EXPIRED: {
    code: '9995',
    msg: '啊哈,有人捷足先登了,重新获取最新记录吧...'
  },
  INVALID_UPDATE_ID: {
    code: '9996',
    msg: '指定的更新记录无效...'
  },
  INVALID_PARAMS: {
    code: '9997',
    msg: '非法请求参数...'
  },
  NO_MORE_RESULTS: {
    code: '9998',
    msg: 'no more results...'
  },
  NO_MORE_RESULTS_ARR: {
    code: '9998',
    msg: 'no more results...',
    data : []
  },
  FAIL: {
    code: '9999',
    msg: '服务器开小差了...'
  },
  GET_LOST: {
    code: '404',
    msg: '迷路了,换条道吧...'
  },
  DUPLICATE_EXTERNAL_ORDER: {
    code: '2007',
    msg: 'This order is in system already'
  },
  INSERT_FULLTEXT_ERROR: {
    code: '2008',
    msg: 'error when inserting fulltext'
  },
  SQL_ERROR: {
    code: '2009',
    msg: 'Error happened when performing query'
  }
};

