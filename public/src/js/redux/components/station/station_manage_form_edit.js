import initManageStationForm from './station_manage_form';

export default initManageStationForm( state => ({
    //赋初始值
    initialValues: state.stationManageForm.stationEditForm.data
  })
)
