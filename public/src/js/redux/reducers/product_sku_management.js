import { ActionTypes } from 'actions/product_sku_management';
import { ActionTypes as CitiesSelectorActionTypes } from 'actions/cities_selector';
import { clone, dateFormat, getDate } from 'utils/index';

const iNow = new Date();

const initialState = {
    basicDataLoadStatus: 'pending',
    addMode: true, // false: 编辑模式

    productName: '', // 商品名称
    buyEntry: 0,     // 购买方式 0:商城可购买 1:外部渠道可购买

    primaryCategories:   new Map(), // 一级分类
    secondaryCategories: new Map(), // 二级分类

    selectPrimaryCategory:   0, // 选中的一级分类
    selectSecondaryCategory: 0, // 选中的二级分类

    activeCitiesOption: 0, // 上线城市范围 0:所有已开通的二级分类 1:二级分类里选中的城市

    citiesOptionApplyRange: 0, // 城市配置应用范围
    citiesOptions: new Map(),  // 城市配置缓存表

    orderSource:   new Map([[0, 'PC商城'], [1, '手机APP'], [2, '美团外卖']]),
    provincesData: new Map(),
    citiesData:    new Map(),
    districtsData: new Map(),

    selectedProvince: 0,
    selectedCity: 0,

    cityOptionSavable: false,
    cityOptionSaved: true,

    tempOptions: {
        isPreSale: true,
        onSaleTime: [iNow, new Date(getDate(iNow, 7))],
        delivery: [iNow, new Date(getDate(iNow, 7))],
        bookingTime: 0.5,
        hasSecondaryBookingTime: false,
        secondaryBookingTime: "",
        applyDistrict: new Set(),
        shopSpecifications: [],
        sourceSpecifications: new Map(),
        selectedSource: ""
    },

    saveStatus: 'normal', // normal, padding, success, failed
};

const transformPositionData = obj => [
    obj.id, {
        ...obj,
        checked: false,
        disabled: false
    }
];

const tempOptionsValidator = state => {
    let vaild = true;
    const { tempOptions } = state;

    if (
        (typeof tempOptions.bookingTime) !== 'number'
        || tempOptions.bookingTime <= 0
    ) {
        vaild = false;
    } else if (
        tempOptions.hasSecondaryBookingTime
        && (
            (typeof tempOptions.secondaryBookingTime) !== 'number'
            || tempOptions.secondaryBookingTime <= 0
        )
    ) {
        vaild = false;
    } else if (
        tempOptions.hasSecondaryBookingTime
        && tempOptions.applyDistrict.size === 0
    ) {
        vaild = false;
    } else if (
        tempOptions.shopSpecifications.length === 0 && tempOptions.sourceSpecifications.size === 0
    ) {
        vaild = false;
    }

    for (var index in tempOptions.shopSpecifications) {
        const ss = tempOptions.shopSpecifications[index];
        if (ss.spec.trim() === "") {
            vaild = false
            break;
        }
    }

    const ssArr = [...tempOptions.sourceSpecifications.values()];

    for (let x in ssArr) {
        const ss = ssArr[x];
        if (ss.length === 0) {
            vaild = false
            break;
        }

        for (let y in ss) {
            if (ss[y].spec.trim() === "") {
                vaild = false
                break;
            }

            if (Number(ss[y].cost) <= 0) {
                vaild = false
                break;
            }
        }

        if (!vaild) {
            break;
        }
    }

    return {
        ...state,
        cityOptionSavable: vaild
    }
}

const getCategoriesMap = categoriesData => {
    let primaryCategoriesMap = new Map();
    let secondaryCategoriesMap = new Map();

    categoriesData.filter(
        obj => obj.parent_id === 0
    ).forEach(primaryCategory => {
        primaryCategoriesMap.set(primaryCategory.id, primaryCategory.name);
        secondaryCategoriesMap.set(primaryCategory.id, []);
    });

    categoriesData.filter(
        obj => obj.parent_id !== 0
    ).forEach(secondaryCategory => {
        if (secondaryCategoriesMap.has(secondaryCategory.parent_id)) {
            secondaryCategoriesMap.get(secondaryCategory.parent_id).push({
                id: secondaryCategory.id,
                name: secondaryCategory.name
            });
        }
    });

    [...primaryCategoriesMap.keys()].forEach(pid => {
        if (secondaryCategoriesMap.get(pid).length === 0) {
            primaryCategoriesMap.delete(pid);
        }
    });

    return {
        primaryCategoriesMap,
        secondaryCategoriesMap
    }
}

const getOrderSourcesMap = orderSourceData => {
    let orderSource = new Map();

    orderSourceData.forEach(src => {
        // src.id !== 1
        // id为1是PC官网，禁止1是为了防止渠道设置里重复设置PC官网的渠道的规格
        if (src.id !== 1 && src.level === 2) {
            orderSource.set(src.id, src.name);
        }
    });

    return orderSource;
}

const switchType = {
    [ActionTypes.LOADED_BASIC_DATA]: (state, { categoriesData, orderSourceData }) => {
        let orderSource = getOrderSourcesMap(orderSourceData);
        let { primaryCategoriesMap, secondaryCategoriesMap } = getCategoriesMap(categoriesData);
        let firstID = 0;

        firstID = [...primaryCategoriesMap.keys()][0];

        return {
            ...initialState,
            orderSource,
            basicDataLoadStatus: 'success',
            primaryCategories: primaryCategoriesMap,
            secondaryCategories: secondaryCategoriesMap,
            selectPrimaryCategory: firstID,
            selectSecondaryCategory: secondaryCategoriesMap.get(firstID)[0].id
        };
    },

    [ActionTypes.LOADED_PRODUCT_DATA]: (state, {
        categoriesData,
        orderSourceData,
        citiesSelectorState,
        productData,
        isSelectedAllCity,
        districtsDataGroup
    }) => {

        const now = new Date();
        const orderSource = getOrderSourcesMap(orderSourceData);
        const { primaryCategoriesMap, secondaryCategoriesMap } = getCategoriesMap(categoriesData);

        const citiesData = new Map(
            [...citiesSelectorState.citiesData.values()].filter(
                cityData => citiesSelectorState.checkedCities.has(cityData.id)
            ).map(transformPositionData)
        );

        const provincesData = new Map(
            [...citiesData.values()].map(
                cityData => citiesSelectorState.provincesData.get(cityData.province)
            ).map(transformPositionData)
        );

        const districtsData = new Map(
            Object.keys(districtsDataGroup).map(cityID => [
                Number(cityID),
                Object.keys(districtsDataGroup[cityID]).map(districtID => ({
                    id: Number(districtID),
                    name: districtsDataGroup[cityID][districtID]
                }))
            ])
        );

        state = {
            ...state,
            basicDataLoadStatus: 'success',
            addMode: false,

            productName: productData.product.product_name,
            buyEntry: productData.sku.some(sku => sku.website === "1") ? 0 : 1,

            primaryCategories: primaryCategoriesMap,
            secondaryCategories: secondaryCategoriesMap,

            selectPrimaryCategory: productData.product.primary_cate_id,
            selectSecondaryCategory: productData.product.secondary_cate_id,

            activeCitiesOption: isSelectedAllCity ? 0 : 1,

            citiesOptionApplyRange: 1,

            orderSource,
            provincesData,
            citiesData,
            districtsData,

            cityOptionSavable: true,
            cityOptionSaved: true
        }

        productData.sku.forEach(sku => {
            if (state.citiesOptions.has(sku.regionalism_id)) {
                const cityOpt = state.citiesOptions.get(sku.regionalism_id);

                if (sku.website === "1") {
                    cityOpt.shopSpecifications.push({
                        id: sku.id,
                        spec: sku.size,
                        originalCost: sku.original_price/100,
                        cost: sku.price/100,
                        hasEvent: sku.activity_price !== null,
                        eventCost: sku.activity_price !== null ? sku.activity_price : 0.01,
                        eventTime: sku.activity_price !== null ? [new Date(sku.activity_start), new Date(sku.activity_end)] : [now, new Date(getDate(now, 7))]
                    })
                } else {
                    cityOpt.sourceSpecifications.set(Number(sku.website), [{
                        id: sku.id,
                        spec: sku.size,
                        cost: sku.price
                    }]);
                }
            } else {
                let tempOptions = clone(initialState.tempOptions);

                tempOptions.isPreSale = sku.presell_start !== null;
                tempOptions = {
                    ...tempOptions,
                    onSaleTime: tempOptions.isPreSale ? [] : [iNow, new Date(getDate(iNow, 7))],
                    delivery: tempOptions.isPreSale ? [] : [iNow, new Date(getDate(iNow, 7))],
                    bookingTime: sku.book_time,
                    hasSecondaryBookingTime: sku.secondary_book_time.time !== null,
                    applyDistrict: new Set(sku.secondary_book_time.regions)
                }
                tempOptions.secondaryBookingTime = tempOptions.hasSecondaryBookingTime ? sku.secondary_book_time.time : "";

                tempOptions.shopSpecifications = sku.website !== "1" ? [] : [{
                    id: sku.id,
                    spec: sku.size,
                    originalCost: sku.original_price/100,
                    cost: sku.price/100,
                    hasEvent: sku.activity_price !== null,
                    eventCost: sku.activity_price !== null ? sku.activity_price : 0.01,
                    eventTime: sku.activity_price !== null ? [new Date(sku.activity_start), new Date(sku.activity_end)] : [now, new Date(getDate(now, 7))]
                }];

                tempOptions.sourceSpecifications = sku.website === "1" ? new Map() : new Map([[
                    Number(sku.website), [{
                        id: sku.id,
                        spec: sku.size,
                        cost: sku.price
                    }]
                ]]);

                state.citiesOptions.set(sku.regionalism_id, clone(tempOptions));
            }
        });

        state.tempOptions = clone([...state.citiesOptions.values()][0]);
        state.selectedCity = [...state.citiesOptions.keys()][0];
        state.selectedProvince = state.citiesData.get(state.selectedCity).province;

        if (state.tempOptions.sourceSpecifications.size) {
            state.tempOptions.selectedSource = [...state.tempOptions.sourceSpecifications.keys()][0];
        }

        return state;
    },

    [ActionTypes.CHANGE_PRODUCT_NAME]: (state, { name }) => {
        return {
            ...state,
            productName: name
        };
    },

    [ActionTypes.CHANGE_BUY_ENTRY]: (state, { entry }) => {
        return {
            ...state,
            buyEntry: entry
        };
    },

    [ActionTypes.CHANGE_SELECTED_PRIMARY_CATEGORY]: (state, { id }) => {
        return {
            ...state,
            selectPrimaryCategory: id
        };
    },

    [ActionTypes.CHANGE_SELECTED_SECONDARY_CATEGORY]: (state, { id }) => {
        return {
            ...state,
            selectSecondaryCategory: id
        };
    },

    [ActionTypes.CHANGE_ACTIVE_CITIES]: (state, { option }) => {
        return {
            ...state,
            activeCitiesOption: option
        };
    },

    [ActionTypes.CHANGE_APPLY_RANGE]: (state, { option }) => {
        if (state.citiesOptionApplyRange === 0) {
            state.citiesOptions.set('all', clone(state.tempOptions));
        }

        if (option === 0) {
            if (state.citiesOptions.has('all')) {
                state.tempOptions = clone(state.citiesOptions.get('all'));
            } else {
                state.tempOptions = clone(initialState.tempOptions);
                state.cityOptionSavable = false;
            }
        }

        if (option === 1) {
            if (state.citiesOptions.has(state.selectedCity)) {
                state.tempOptions = clone(state.citiesOptions.get(state.selectedCity));
            } else {
                state.tempOptions = clone(initialState.tempOptions);
                state.cityOptionSavable = false;
            }
        }

        return {
            ...state,
            citiesOptionApplyRange: option
        };
    },

    [CitiesSelectorActionTypes.CHANGED_CHECK_CITIES]: (state, { citiesSelectorState }) => {
        const { checkedCities } = citiesSelectorState;

        const transformPositionData = obj => [
            obj.id, {
                ...obj,
                checked: false,
                disabled: false
            }
        ];

        const citiesData = new Map(
            [...citiesSelectorState.citiesData.values()].filter(
                cityData => checkedCities.has(cityData.id)
            ).map(transformPositionData)
        );

        const provincesData = new Map(
            [...citiesData.values()].map(
                cityData => citiesSelectorState.provincesData.get(cityData.province)
            ).map(transformPositionData)
        );

        let { selectedProvince, selectedCity } = state;

        if (!provincesData.has(selectedProvince))
            selectedProvince = [...provincesData.keys()][0];

        if (!citiesData.has(selectedCity))
            selectedCity = [...citiesData.keys()][0] || 0;

        const citiesDataKeySet = new Set([...citiesData.keys()]);
        const diff = [...state.citiesOptions.keys()].filter(x => !citiesDataKeySet.has(x) && x !== 'all');

        diff.forEach(deleteId => {
            state.citiesOptions.delete(deleteId);
        });

        if (state.citiesOptions.has(selectedCity)) {
            state.tempOptions = clone(state.citiesOptions.get(selectedCity));
            state.cityOptionSaved = true;
        } else {
            state.tempOptions = clone(initialState.tempOptions);
            state.cityOptionSaved = false;
        }

        return {
            ...state,
            citiesData,
            provincesData,
            selectedProvince,
            selectedCity
        };
    },

    [ActionTypes.CHANGE_SELECTED_PROVINCE]: (state, { id }) => {
        let selectedCity;
        let tempOptions;

        for (let cid in state.provincesData.get(id).list) {
            if (state.citiesData.has(cid)) {
                selectedCity = cid;
                break;
            }
        }

        if (state.citiesOptions.has(selectedCity)) {
            tempOptions = clone(state.citiesOptions.get(selectedCity));
        } else {
            tempOptions = clone(initialState.tempOptions);
        }

        return {
            ...state,
            cityOptionSaved: state.citiesOptions.has(selectedCity),
            selectedCity,
            selectedProvince: id,
            tempOptions
        };
    },

    [ActionTypes.CHANGE_SELECTED_CITY]: (state, { id }) => {
        if (state.citiesOptions.has(id)) {
            state.tempOptions = clone(state.citiesOptions.get(id));
        } else {
            state.tempOptions = clone(initialState.tempOptions);
            state.cityOptionSavable = false;
        }

        return {
            ...state,
            cityOptionSaved: state.citiesOptions.has(id),
            selectedCity: id
        };
    },

    [ActionTypes.CHANGE_PRESALE_STATUS]: state => {
        return {
            ...state,
            cityOptionSaved: false,
            tempOptions: {
                ...state.tempOptions,
                isPreSale: !state.tempOptions.isPreSale
            }
        };
    },

    [ActionTypes.CHANGE_PRESALE_TIME]: (state, { beginTime, endTime }) => {
        return tempOptionsValidator({
            ...state,
            cityOptionSaved: false,
            tempOptions: {
                ...state.tempOptions,
                onSaleTime: [ beginTime, endTime ]
            }
        });
    },

    [ActionTypes.CHANGE_DELIVERY_TIME]: (state, { beginTime, endTime }) => {
        return {
            ...state,
            cityOptionSaved: false,
            tempOptions: {
                ...state.tempOptions,
                delivery: [ beginTime, endTime ]
            }
        }
    },

    [ActionTypes.CHANGE_BOOKING_TIME]: (state, { hour }) => {
        return tempOptionsValidator({
            ...state,
            cityOptionSaved: false,
            tempOptions: {
                ...state.tempOptions,
                bookingTime: hour
            }
        });
    },

    [ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_STATUS]: (state, { districtsData }) => {
        if (!state.districtsData.has(state.tempOptions.selectedCity)) {
            const dd = Object.keys(districtsData).map(
                id => ({
                    id,
                    name: districtsData[id]
                })
            );

            state.districtsData.set(state.selectedCity, dd);
        }

        state.tempOptions.hasSecondaryBookingTime = !state.tempOptions.hasSecondaryBookingTime;

        state.cityOptionSaved = false;
        return tempOptionsValidator(state);
    },

    [ActionTypes.CHANGE_SECONDARY_BOOKINGTIME]: (state, { hour }) => {
        return tempOptionsValidator({
            ...state,
            cityOptionSaved: false,
            tempOptions: {
                ...state.tempOptions,
                secondaryBookingTime: hour
            }
        });
    },

    [ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_RANGE]: (state, { districtCode }) => {
        let { applyDistrict } = state.tempOptions;

        applyDistrict[applyDistrict.has(districtCode) ? 'delete' : 'add'](districtCode);

        return tempOptionsValidator({
            ...state,
            cityOptionSaved: false,
            tempOptions: {
                ...state.tempOptions,
                applyDistrict
            }
        });
    },

    [ActionTypes.CREATE_SHOP_SPECIFICATIONS]: (state, { index }) => {
        let { shopSpecifications } = state.tempOptions;

        const now = new Date();

        let newShopSpecifications = {
            id: 0,
            spec: "",
            originalCost: 0.01,
            cost: 0.01,
            hasEvent: false,
            eventCost: 0.01,
            eventTime: [now, new Date(getDate(now, 7))]
        }

        shopSpecifications.push(newShopSpecifications);

        state.cityOptionSaved = false;
        state.cityOptionSavable = false;

        return state;
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS]: (state, { index, spec }) => {
        state.tempOptions.shopSpecifications[index].spec = spec;

        state.cityOptionSaved = false;
        return tempOptionsValidator(state);
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_ORIGINAL_COST]: (state, { index, money }) => {
        state.tempOptions.shopSpecifications[index].originalCost = Number(money) || 0;

        state.cityOptionSaved = false;
        return tempOptionsValidator(state);
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_COST]: (state, { index, money }) => {
        state.tempOptions.shopSpecifications[index].cost = Number(money) || 0;

        state.cityOptionSaved = false;
        return tempOptionsValidator(state);
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_STATUS]: (state, { index }) => {
        let { shopSpecifications } = state.tempOptions;
        shopSpecifications[index].hasEvent = !shopSpecifications[index].hasEvent;

        state.cityOptionSaved = false;
        return state;
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_COST]: (state, { index, money }) => {
        state.tempOptions.shopSpecifications[index].eventCost = Number(money) || 0;

        state.cityOptionSaved = false;
        return tempOptionsValidator(state);
    },

    [ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_TIME]: (state, { index, beginTime, endTime }) => {
        state.tempOptions.shopSpecifications[index].eventTime = [beginTime, endTime];

        state.cityOptionSaved = false;
        return state;
    },

    [ActionTypes.REMOVE_SHOP_SPECIFICATIONS]: (state, { index }) => {
        state.tempOptions.shopSpecifications = state.tempOptions.shopSpecifications.filter((x, i) => i !== index);

        state.cityOptionSaved = false;
        return tempOptionsValidator(state);
    },

    [ActionTypes.ADD_SOURCE]: (state, { sourceId }) => {
        if (!state.tempOptions.sourceSpecifications.has(sourceId)) {
            let sourceSpec = [];

            if (state.buyEntry === 0) {
                sourceSpec = state.tempOptions.shopSpecifications.map(
                    ({ spec, cost }) => ({ spec, cost })
                );
            }

            state.tempOptions.sourceSpecifications.set(sourceId, sourceSpec);
        }

        state.tempOptions.selectedSource = sourceId;

        state.cityOptionSaved = false;

        return tempOptionsValidator(state);
    },

    [ActionTypes.REMOVE_SOURCE]: (state, { sourceId }) => {
        state.tempOptions.sourceSpecifications.delete(sourceId);

        state.cityOptionSaved = false;
        return tempOptionsValidator(state);
    },

    [ActionTypes.CHANGE_SELECTED_SOURCE]: (state, { sourceId }) => {
        state.tempOptions.selectedSource = sourceId;

        state.cityOptionSaved = false;
        return state;
    },

    [ActionTypes.ADD_SOURCE_SPEC]: state => {
        state.tempOptions.sourceSpecifications.get(state.tempOptions.selectedSource).push({
            id: 0,
            spec: '',
            cost: 0.01
        });

        state.cityOptionSaved = false;
        state.cityOptionSavable = false;

        return state;
    },

    [ActionTypes.REMOVE_SOURCE_SPEC]: (state, { index }) => {
        let sourceSpecification = state.tempOptions.sourceSpecifications.get(state.tempOptions.selectedSource);

        sourceSpecification = sourceSpecification.filter((x, i) => i !== index);

        state.tempOptions.sourceSpecifications.set(state.tempOptions.selectedSource, sourceSpecification);

        state.cityOptionSaved = false;
        return state;
    },

    [ActionTypes.CHANGE_SOURCE_SPEC]: (state, { index, spec }) => {
        state.tempOptions.sourceSpecifications.get(state.tempOptions.selectedSource)[index].spec = spec;

        state.cityOptionSaved = false;
        return tempOptionsValidator(state);
    },

    [ActionTypes.CHANGE_SOURCE_SPEC_COST]: (state, { index, money }) => {
        state.tempOptions.sourceSpecifications.get(state.tempOptions.selectedSource)[index].cost = Number(money) || 0;

        state.cityOptionSaved = false;
        return tempOptionsValidator(state);
    },

    [ActionTypes.SAVE_CITIY_OPTION]: state => {
        state.citiesOptions.set(state.selectedCity, clone(state.tempOptions));
        state.cityOptionSaved = true;
        state.citiesData.get(state.selectedCity).checked = true;

        return state;
    },

    [ActionTypes.SAVE_OPTION]: (state, { saveStatus }) => {
        return {
            ...state,
            saveStatus
        }
    },

    [ActionTypes.RESET_SAVE_STATUS]: state => {
        return {
            ...state,
            saveStatus: 'normal'
        }
    }
};

const productSKUManagement = (state = initialState, action) => {
    return action.type in switchType
    ? switchType[action.type](clone(state), action)
    : state;
}

export default productSKUManagement;