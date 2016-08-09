import initRefundPannel from './refund_modal';

export default initRefundPannel(state => ({
	initialValues : state.orderManage.refund_data.refund_apply_data
}))