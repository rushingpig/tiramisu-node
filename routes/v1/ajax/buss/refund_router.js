"use strict";

var refundService = require('../../../../service/buss/order/refund_service');
module.exports = function (router) {
//*********************
//******** GET ********
//*********************
    router.get('/order/:orderId/relate/list', refundService.getRelateList);  // 获取相关联的订单列表
    router.get('/order/:orderId/refund/option', refundService.getRefundOption);  // 获取订单退款需要的数据
    router.get('/refund/reason/type', refundService.getReasonType);  // 获取退款原因种类
    router.get('/refund/list', refundService.getRefundList);  //  获取退款列表
    router.get('/refund/:refundId', refundService.getRefundInfo);  // 获取退款详情
    router.get('/refund/:refundId/history', refundService.getRefundHistory);  // 操作历史纪录

    router.get('refund/export',refundService.excelExport);  // 导出退款记录列表

//**********************
//******** POST ********
//**********************
    router.post('/refund', refundService.addRefund);  // 退款申请


//*********************
//******** PUT ********
//*********************
    router.put('/refund/:refundId', refundService.editRefund);  // 编辑/审核/完成
    router.put('/refund/:refundId/remarks', refundService.editRefundRemarks);  // 修改备注

//************************
//******** DELETE ********
//************************
    router.delete('/refund/:refundId', refundService.delRefund);  //  取消

};
