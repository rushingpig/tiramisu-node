import InvoiceApplyPannel from './invoice_apply_pannel';

export default InvoiceApplyPannel(state =>({
  initialValues: state.invoiceManage.main.order_invoice_info
}))