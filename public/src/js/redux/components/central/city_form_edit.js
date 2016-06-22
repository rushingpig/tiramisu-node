import initAddCityForm from './city_form';

export default initAddCityForm(state =>({
  initialValues: state.accessibleCityManage.accessible_city_info
}))