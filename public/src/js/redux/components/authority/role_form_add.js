import initRoleForm from './role_form';

export default initRoleForm(state => ({
	initialValues:{'name':'','description':'','data_scope_id':-1,'org_id':-1}
}))