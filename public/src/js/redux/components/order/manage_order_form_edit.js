import initManageAddForm from './manage_order_form';

export default initManageAddForm( state => ({
    //赋初始值
    initialValues: state.orderManageForm.mainForm.data
  })
)
