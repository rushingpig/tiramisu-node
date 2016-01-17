import { PUT, TEST } from 'utils/request'; //Promise
import Url from 'config/url';
import { Noty } from 'utils/index';

export const GET_PRINT_REVIEW_LIST = 'GET_PRINT_REVIEW_LIST';
export function getPrintReviewList(data){
  // return (dispatch, getState) => {
  //   // var filter_data = getValues(getState().form.order_manage_filter);
  //   return GET(Url.print_review_list.toString(), data, GET_PRINT_REVIEW_LIST)(dispatch)
  //     .fail(function(msg, code){
  //       if(code == NO_MORE_CODE){
  //         //这里注意Noty  
  //         Noty('alert', '没有查询到任何结果');
  //       }
  //     });
  // }
  return TEST({
    total: 1,
    page_no: 0,
    list: [{
      'applicant_mobile':  '申请人手机-todo',
      'applicant_name':  '申请人名字-todo',
      'apply_id':  '申请记录ID-todo',
      'apply_reason':  '申请理由-todo',
      'apply_time':  '申请时间-todo',
      'audit_':  '审核意见-todo',
      'audit_time':  '审核时间-todo',
      'auditor': '审核人-todo',
      'is_reprint':  '是否已经重新打印-todo',
      'order_id':  '订单号-todo',
      'reprint_time':  '重新打印时间-todo',
      'status':  '审核状态-todo',
      'validate_code':  '短信验证码-todo',
    }]
  }, GET_PRINT_REVIEW_LIST, 2000)
}

//审核重新打印申请
export const REVIEW_PRINT_APPLY = 'REVIEW_PRINT_APPLY'; //key: 0->正在处理，1->成功，2->失败
export function reviewPrintApply(apply_id, data) {
  //若是异步的话，那么该函数必须也返回一个函数
  // return PUT(Url.review_print_apply.toString(apply_id), data, REVIEW_PRINT_APPLY);
  return TEST(null, [
    {type: REVIEW_PRINT_APPLY, key: 0},  //立即派发
    {type: REVIEW_PRINT_APPLY, key: 1}   //2000毫秒后派发
  ], 1000, true);
}