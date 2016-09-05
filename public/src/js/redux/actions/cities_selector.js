import { clone } from 'utils/index';

const ActionTypes = {
  LOAD_DATA:          Symbol('CITIES_SELECTOR_LOAD_SELECTOR_DATA'),
  SET_ENABLE_LIST:    Symbol('CITIES_SELECTOR_SET_ENABLE_LIST'),
  REMOVE_ENABLE_LIST: Symbol('CITIES_SELECTOR_REMOVE_ENABLE_LIST'),
  RESET_CHECKDATA:    Symbol('CITIES_SELECTOR_RESET_CHECKDATA'),
  RESET_SELECTOR:     Symbol('CITIES_SELECTOR_RESET_SELECTOR'),

  CHANGE_SELECTED_PROVINCE: Symbol('CITIES_SELECTOR_CHANGE_SELECTED_PROVINCE'),
  CHECK_PROVINCE:           Symbol('CITIES_SELECTOR_CHECK_PROVINCE'),
  UNCHECK_PROVINCE:         Symbol('CITIES_SELECTOR_UNCHECK_PROVINCE'),

  CHECK_CITY:             Symbol ('CITIES_SELECTOR_CHECK_CITY'),
  UNCHECK_CITY:           Symbol ('CITIES_SELECTOR_UNCHECK_CITY'),
  CHECK_ALL_CITIES:       Symbol ('CITIES_SELECTOR_CHECK_ALL_CITIES'),
  UNCHECK_ALL_CITIES:     Symbol ('CITIES_SELECTOR_UNCHECK_ALL_CITIES'),
  RESTORE_CHECKED_CITIES: Symbol ('CITIES_SELECTOR_RESTORE_CHECKED_CITIES'),
  
  CHANGED_CHECK_CITIES: Symbol('CHANGED_CHECK_CITIES')
};

const changeSelectedProvince = provinceId => ({
  type: ActionTypes.CHANGE_SELECTED_PROVINCE,
  provinceId
});

const toggleProvinceCheckStatus = provinceId => (
  (dispatch, getState) => {
    const {
      citiesSelector: {
        checkedProvinces
      }
    } = getState();

    dispatch({
      type: checkedProvinces.has(provinceId) ? ActionTypes.UNCHECK_PROVINCE : ActionTypes.CHECK_PROVINCE,
      provinceId
    });

    dispatch({ type: ActionTypes.CHANGED_CHECK_CITIES, citiesSelectorState: clone(getState().citiesSelector) });
  }
);

const toggleCityCheckStatus = cityId => (
  (dispatch, getState) => {
    const {
      citiesSelector: {
        checkedCities,
        checkedProvinces,
        citiesData
      }
    } = getState();

    const provinceId = citiesData.get(cityId).province;

    if (checkedProvinces.has(provinceId) || checkedCities.has(cityId)) {
      dispatch({
        type: ActionTypes.UNCHECK_CITY,
        cityId
      });
    } else {
      dispatch({
        type: ActionTypes.CHECK_CITY,
        cityId
      });
    }

    dispatch({ type: ActionTypes.CHANGED_CHECK_CITIES, citiesSelectorState: clone(getState().citiesSelector) });
  }
);

const checkedAllCities = () => (
  (dispatch, getState) => {
    dispatch({ type: ActionTypes.CHECK_ALL_CITIES });
    dispatch({ type: ActionTypes.CHANGED_CHECK_CITIES, citiesSelectorState: clone(getState().citiesSelector) });
  }
);

const unCheckAllCities = () => (
  (dispatch, getState) => {
    dispatch({ type: ActionTypes.UNCHECK_ALL_CITIES });
    dispatch({ type: ActionTypes.CHANGED_CHECK_CITIES, citiesSelectorState: clone(getState().citiesSelector) });
  }
);

export { ActionTypes };

export default {
  changeSelectedProvince,
  toggleProvinceCheckStatus,
  toggleCityCheckStatus,
  unCheckAllCities
};