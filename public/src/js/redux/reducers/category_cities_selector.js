import { Selector as ActionTypes } from 'actions/category_action_types';
import clone from 'clone';

const initialState = {
    provincesData:       new Map(),
    citiesData:          new Map(),
    selectedProvince:    0,
    checkedProvinces:    new Set(),
    checkedCities:       new Set(),
    originCheckedCities: new Set()
};

const transformGeographiesData = source => {
    const provincesData = new Map();
    const citiesData    = new Map();

    source.forEach(obj => {

        let { province_id, province_name, city_id, city_name } = obj;

        province_id = Number(province_id);
        city_id     = Number(city_id);

        if ( !provincesData.has(province_id) ) {
            provincesData.set(province_id, {
                id:     province_id,
                name:   province_name,
                list:   new Set(),
                enable: true
            });
        }

        citiesData.set(city_id, {
            id:       city_id,
            name:     city_name,
            province: province_id,
            enable:   true
        });

        provincesData.get(province_id).list.add(city_id);
    });

    return {
        provincesData,
        citiesData
    };
};

const transformEnableList = (originProvincesData, originCitiesData, enableList) => {
    const provincesData = new Map();
    const citiesData    = new Map();

    const enableProvinces = new Set();
    const enableCities    = new Set();

    enableList.forEach(obj => {
        enableProvinces.add(obj.province_id);
        enableCities.add(obj.city_id);
    });

    [...originProvincesData].forEach(([key, value]) => {
        provincesData.set(key, {
            ...value,
            list:   new Set([...value.list]),
            enable: enableProvinces.has(value.id)
        });
    });

    [...originCitiesData].forEach(([key, value]) => {
        citiesData.set(key, {
            ...value,
            enable: enableCities.has(value.id)
        });
    });

    return {
        provincesData,
        citiesData
    };
}

const switchType = {

    [ActionTypes.LOAD_DATA]: (state, { geographiesData, chekcedData, enableList = false }) => {

        let { provincesData, citiesData } = transformGeographiesData(geographiesData);

        if (enableList) {
            const result  = transformEnableList(provincesData, citiesData, enableList);
            provincesData = result.provincesData;
            citiesData    = result.citiesData;
        }

        let checkedProvinces = new Set();
        let checkedCities    = new Set();

        checkedCities = new Set(chekcedData.map(
            ({ city_id }) => Number(city_id)
        ));

        if (checkedCities.size) {
            [...provincesData.values()].forEach(obj => {
                const different = new Set([...obj.list].filter(id => !checkedCities.has(id))).size;

                if (different === 0) {
                    checkedProvinces.add(obj.id);
                }
            });
        }

        return {
            ...state,
            provincesData,
            citiesData,
            selectedProvince: 0,
            checkedProvinces,
            checkedCities,
            originCheckedCities: new Set([...checkedCities])
        };
    },

    [ActionTypes.SET_ENABLE_LIST]: (state, { enableList }) => {

        const { provincesData, citiesData }  = transformEnableList(state.provincesData, state.citiesData, enableList);

        return {
            ...state,
            selectedProvince: 0,
            checkedProvinces: new Set(),
            checkedCities:    new Set(),
            provincesData,
            citiesData
        };
    },

    [ActionTypes.REMOVE_ENABLE_LIST]: state => {

        const enableList = [...citiesData].map(([key, obj]) => ({
            province_id: obj.province,
            city_id: obj.id
        }));
        
        const { provincesData, citiesData }  = transformEnableList(state.provincesData, state.citiesData, enableList);

        return {
            ...state,
            selectedProvince: 0,
            checkedProvinces: new Set(),
            checkedCities:    new Set(),
            provincesData,
            citiesData
        };
    },

    [ActionTypes.RESET_CHECKDATA]: state => {
        return {
            ...state,
            checkedProvinces:    new Set(),
            checkedCities:       new Set(),
            originCheckedCities: new Set()
        };
    },

    [ActionTypes.RESET_SELECTOR]: state => {
        return initialState;
    },

    [ActionTypes.CHANGE_SELECTED_PROVINCE]: (state, { provinceId }) => {
        return {
            ...state,
            selectedProvince: provinceId
        };
    },

    [ActionTypes.CHECK_PROVINCE]: (state, { provinceId }) => {

        const { provincesData } = state;
        const province          = provincesData.get(provinceId);

        let newProvincesData    = provincesData;
        let newCheckedProvinces = new Set([provinceId, ...state.checkedProvinces]);
        let newCitiesData       = [];
        let citiesDataKeys;

        citiesDataKeys = [...state.citiesData].filter(
            ([key, obj]) => obj.province === provinceId
        ).map(
            ([key, obj]) => obj.id
        );

        let newCheckedCities = new Set([...state.checkedCities, ...citiesDataKeys]);

        return {
            ...state,
            provincesData:    newProvincesData,
            checkedProvinces: newCheckedProvinces,
            checkedCities:    newCheckedCities,
            citiesData: new Map([
                ...state.citiesData,
                ...newCitiesData
            ])
        };
    },

    [ActionTypes.UNCHECK_PROVINCE]: (state, { provinceId }) => {
        const checkedProvinces = new Set([...state.checkedProvinces]);
        const { list } = state.provincesData.get(provinceId);
        const checkedCities = new Set(
            [...state.checkedCities].filter(x => !list.has(x))
        );

        checkedProvinces.delete(provinceId);

        return {
            ...state,
            checkedProvinces,
            checkedCities
        };
    },

    [ActionTypes.CHECK_CITY]: (state, { cityId }) => {

        let { selectedProvince, checkedProvinces } = state;
        let newCheckedCities = new Set([cityId, ...state.checkedCities]);

        const citiesList = state.provincesData.get(selectedProvince).list;
        const newSize    = newCheckedCities.size;
        const unionSize  = new Set([...citiesList, ...newCheckedCities]).size;

        // 被选取的城市的所在省份的城市编号集合
        // 与添加新城市后，所有被选取城市的集合
        // 如果它们的并集的数量没有改变，则说明被选取的城市的所在省份，旗下所有城市都已经被选中
        if (newSize === unionSize) {
            checkedProvinces = new Set([selectedProvince, ...state.checkedProvinces]);
        }

        return {
            ...state,
            checkedProvinces,
            checkedCities: newCheckedCities
        };
    },

    [ActionTypes.UNCHECK_CITY]: (state, { cityId }) => {

        let {
            checkedCities,
            citiesData,
            checkedProvinces,
            provincesData
        } = state;

        let provinceId   = citiesData.get(cityId).province;
        checkedProvinces = new Set([...checkedProvinces]);

        checkedProvinces.delete(provinceId);
        checkedCities.delete(cityId);

        return {
            ...state,
            checkedProvinces,
            checkedCities
        };
    },

    [ActionTypes.CHECK_ALL_CITIES]: state => {
        const checkedCities = new Set(
            [...state.citiesData.values()].filter(
                obj => obj.enable
            ).map(
                obj => obj.id
            )
        );

        const checkedProvinces = new Set(
            [...state.provincesData.values()].filter(
                obj => obj.enable
            ).map(
                obj => obj.id
            )
        );

        return {
            ...state,
            checkedCities,
            checkedProvinces
        };
    },

    [ActionTypes.UNCHECK_ALL_CITIES]: state => {
        return {
            ...state,
            type: ActionTypes.UNCHECK_ALL_CITIES,
            checkedCities: new Set(),
            checkedProvinces: new Set()
        };
    },
};

const citiesSelector = (state = initialState, action) => action.type in switchType
? switchType[action.type](clone(state), action)
: state;

export default citiesSelector;