"use strict";

var invoiceService = require('../../../../service/buss/order/invoice_service');
module.exports = function (router) {
//*********************
//******** GET ********
//*********************
    router.get('/company/list', invoiceService.getCompanyList);  // 获取公司列表
    router.get('/company/:companyId', invoiceService.getCompanyInfo);  // 获取公司信息
    router.get('/company/:companyId/history', invoiceService.getCompanyHistory);  // 获取公司信息修改记录

    router.get('/invoice/company/list', invoiceService.getInvoiceCompanyList);  // 获取公司列表
    router.get('/order/:orderId/invoice/option', invoiceService.getInvoiceOption);  // 获取开发票所需数据
    router.get('/invoice/express/list', invoiceService.getExpressList);  // 获取可选的物流

    router.get('/invoice/list', invoiceService.getInvoiceList);  // 获取发票列表
    router.get('/invoice/:invoiceId', invoiceService.getInvoiceInfo);  // 获取发票信息
    router.get('/invoice/:invoiceId/history', invoiceService.getInvoiceHistory);  // 获取发票信息修改记录


//**********************
//******** POST ********
//**********************
    router.post('/company', invoiceService.addCompany);  // 添加公司信息
    router.post('/invoice', invoiceService.addInvoice);  // 申请发票


//*********************
//******** PUT ********
//*********************
    router.put('/company/:companyId', invoiceService.editCompany);  // 编辑公司信息
    router.put('/company/:companyId/review', invoiceService.reviewCompany);  // 审核公司信息

    router.put('/invoice/:invoiceId', invoiceService.editInvoice);  // 编辑发票信息
    router.put('/invoice/:invoiceId/express', invoiceService.setInvoiceExpress);  // 设置物流信息
    router.put('/invoice/:invoiceId/remarks', invoiceService.editInvoiceRemarks);  // 修改备注

//************************
//******** DELETE ********
//************************
    router.delete('/company/:companyId', invoiceService.delCompany);  // 删除添加公司信息
    router.delete('/invoice/:invoiceId', invoiceService.delInvoice);  // 取消发票申请

};
