import { Selector as ActionTypes } from './category_action_types';

const changeSelectedProvince = provinceId => ({
    type: ActionTypes.CHANGE_SELECTED_PROVINCE,
    provinceId
});

const toggleProvinceCheckStatus = provinceId => (
    (dispatch, getState) => {
        const {
            categoryCitiesSelector: {
                checkedProvinces
            }
        } = getState();

        dispatch({
            type: checkedProvinces.has(provinceId) ? ActionTypes.UNCHECK_PROVINCE : ActionTypes.CHECK_PROVINCE,
            provinceId
        });
    }
);

const toggleCityCheckStatus = cityId => (
    (dispatch, getState) => {
        const {
            categoryCitiesSelector: {
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
    }
);

const checkedAllCities = () => ({
    type: ActionTypes.CHECK_ALL_CITIES
});

const unCheckAllCities = () => ({
    type: ActionTypes.UNCHECK_ALL_CITIES
});

export default {
    changeSelectedProvince,
    toggleProvinceCheckStatus,
    toggleCityCheckStatus,
    unCheckAllCities
};