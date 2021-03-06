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
  EXIST_USERNAME : {
    code : '1003',
    msg : '该用户名已存在,请重新输入...'
  },
  USER_NOT_EXIST : {
    code : '1004',
    msg : '该用户不存在,请确认用户ID...'
  },
  USER_NOT_USABLE : {
    code : '1005',
    msg : '该用户已被禁用,请联系管理员...'
  },
  PWD_NOT_CONSISTENT : {
    code : '1006',
    msg : '新密码与确认密码不一致,请重新输入...'
  },
  INCORRECT_PWD : {
    code : '1007',
    msg : '旧密码输入有误,请重新输入...'
  },
  EXIST_USER_MOBILE : {
    code : '1008',
    msg : '该手机号码已存在,请重新输入...'
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
  ABORTED_BY_REFUND: {
    code: '2012',
    msg: '该订单有未处理的退款请求，请先取消退款'
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
  },
  DUPLICATE_SKU_SIZE: {
    code: '2016',
    msg: '规格名称重复'
  },
  REDUNDANCY_ERROR: {
    code: '2013',
    msg: 'Error order info redundancy'
  },
  ALREADY_IN_BLACKLIST: {
    code: '2012',
    msg: '该用户已经被加入到黑名单,请设置是否可用即可'
  }
};

