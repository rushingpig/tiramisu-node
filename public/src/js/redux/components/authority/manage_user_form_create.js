import initManageAddForm from './manage_user_form';

export default initManageAddForm(state =>({
  initialValues:{'role_ids':[],'city_ids':[],'station_ids':[]}
}))
