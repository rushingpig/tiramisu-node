import initRoleForm from './role_form';

export default initRoleForm(state => ({
	initialValues:state.DeptRoleManage.RoleManage.role_info
}))