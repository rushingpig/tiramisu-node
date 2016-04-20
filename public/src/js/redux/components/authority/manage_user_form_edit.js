import initManageAddForm from './manage_user_form';

export default initManageAddForm(state =>({
  initialValues:state.UserManageForm.mainForm.data
}))
