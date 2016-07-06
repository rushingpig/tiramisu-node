import Req from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat } from 'utils/index';

import { ActionTypes as CitiesSelectorActionTypes } from './cities_selector';

const ActionTypes = {
  LOADED_BASIC_DATA:   Symbol('LOADED_BASIC_DATA'),
  LOADED_PRODUCT_DATA: Symbol('LOADED_PRODUCT_DATA'),

  CHANGE_PRODUCT_NAME:                Symbol('CHANGE_PRODUCT_NAME'),
  CHANGE_BUY_ENTRY:                   Symbol('CHANGE_BUY_ENTRY'),
  CHANGE_SELECTED_PRIMARY_CATEGORY:   Symbol('CHANGE_SELECTED_PRIMARY_CATEGORY'),
  CHANGE_SELECTED_SECONDARY_CATEGORY: Symbol('CHANGE_SELECTED_SECONDARY_CATEGORY'),
  CHANGE_ORIGINAL_PRICE:              Symbol('CHANGE_ORIGINAL_PRICE'),
  CHANGE_ACTIVE_CITIES:               Symbol('CHANGE_ACTIVE_CITIES'),
  CHANGE_APPLY_RANGE:                 Symbol('CHANGE_APPLY_RANGE'),

  CHANGE_SELECTED_PROVINCE: Symbol('CHANGE_SELECTED_PROVINCE'),
  CHANGE_SELECTED_CITY:     Symbol('CHANGE_SELECTED_CITY'),

  CHANGE_PRESALE_STATUS: Symbol('CHANGE_PRESALE_STATUS'),
  CHANGE_DELIVERY_TIME:  Symbol('CHANGE_DELIVERY_TIME'),
  CHANGE_PRESALE_TIME:   Symbol('CHANGE_PRESALE_TIME'),
  CHANGE_BOOKING_TIME:   Symbol('CHANGE_BOOKING_TIME'),

  CHANGE_SECONDARY_BOOKINGTIME_STATUS: Symbol('CHANGE_SECONDARY_BOOKINGTIME_STATUS'),
  CHANGE_SECONDARY_BOOKINGTIME:        Symbol('CHANGE_SECONDARY_BOOKINGTIME'),
  CHANGE_SECONDARY_BOOKINGTIME_RANGE:  Symbol('CHANGE_SECONDARY_BOOKINGTIME_RANGE'),

  CREATE_SHOP_SPECIFICATIONS:               Symbol('CREATE_SHOP_SPECIFICATIONS'),
  CHANGE_SHOP_SPECIFICATIONS:               Symbol('CHANGE_SHOP_SPECIFICATIONS'),
  CHANGE_SHOP_SPECIFICATIONS_ORIGINAL_COST: Symbol('CHANGE_SHOP_SPECIFICATIONS_ORIGINAL_COST'),
  CHANGE_SHOP_SPECIFICATIONS_COST:          Symbol('CHANGE_SHOP_SPECIFICATIONS_COST'),
  CHANGE_SHOP_SPECIFICATIONS_EVENT_STATUS:  Symbol('CHANGE_SHOP_SPECIFICATIONS_EVENT_STATUS'),
  CHANGE_SHOP_SPECIFICATIONS_EVENT_COST:    Symbol('CHANGE_SHOP_SPECIFICATIONS_EVENT_COST'),
  CHANGE_SHOP_SPECIFICATIONS_EVENT_TIME:    Symbol('CHANGE_SHOP_SPECIFICATIONS_EVENT_TIME'),
  REMOVE_SHOP_SPECIFICATIONS:               Symbol('REMOVE_SHOP_SPECIFICATIONS'),

  ADD_SOURCE:              Symbol('ADD_SOURCE'),
  REMOVE_SOURCE:           Symbol('REMOVE_SOURCE'),
  CHANGE_SELECTED_SOURCE:  Symbol('CHANGE_SELECTED_SOURCE'),
  ADD_SOURCE_SPEC:         Symbol('ADD_SOURCE_SPEC'),
  REMOVE_SOURCE_SPEC:      Symbol('REMOVE_SOURCE_SPEC'),
  CHANGE_SOURCE_SPEC:      Symbol('CHANGE_SOURCE_SPEC'),
  CHANGE_SOURCE_SPEC_COST: Symbol('CHANGE_SOURCE_SPEC_COST'),

  RESET_SPEC_SET: Symbol('RESET_SPEC_SET'),

  SAVE_CITIY_OPTION: Symbol('SAVE_CITIY_OPTION'),
  SAVE_OPTION:       Symbol('SAVE_OPTION'),
  RESET_SAVE_STATUS: Symbol('RESET_SAVE_STATUS')
};

const es6promisify = function(func) {
  return function(...args) {
    let ctx = this;
    return new Promise((resolve, reject) => {
      func.apply(ctx, args).done(resolve).fail(reject);
    });
  }
};

const get = es6promisify(Req.get);
const post = es6promisify(Req.post);
const put = es6promisify(Req.put);

const loadCategories         = () => get(Url.categories.toString());
const loadAllGeographiesData = () => get(Url.allGeographies.toString());
const loadOrderSource        = () => get(Url.order_srcs.toString());
const loadEnableCities       = id => get(Url.activatedCity.toString(id));
const loadDistricts          = id => get(Url.districts.toString(id));
const addSku                 = postData => post(Url.addSku.toString(), postData);
const getSku                 = id => get(Url.getSku.toString(), { productId: id });
const saveEditSku            = putData => put(Url.saveEditSku.toString(), putData);

const transformPrice = num => {
  let money = Number(num) || 0.01

  if (money < 0)
    money = 0.01

  return Math.trunc(money * 100) / 100
}

const returnRegionalismID = obj => obj.regionalism_id;

const loadBasicData = (productId = 0) => (
  (dispatch, getState) => {
    dispatch({ type: CitiesSelectorActionTypes.RESET_SELECTOR });

    if (productId === 0) {
      return Promise.all([
        loadCategories(),
        loadAllGeographiesData(),
        loadOrderSource()
      ]).then(([
        categoriesData,
        geographiesData,
        orderSourceData
      ]) => {
        return loadEnableCities(categoriesData[0].id).then(
          enableList => {
            dispatch({
              type: CitiesSelectorActionTypes.LOAD_DATA,
              geographiesData,
              enableList
            });

            dispatch({
              type: ActionTypes.LOADED_BASIC_DATA,
              categoriesData,
              orderSourceData
            });

            const sid = getState().productSKUManagement.selectSecondaryCategory;

            return changeSelectedSecondaryCategory(sid)(dispatch, getState)
          }
        );
      });
    }

    return Promise.all([
      loadCategories(),
      loadAllGeographiesData(),
      loadOrderSource(),
      getSku(productId)
    ]).then(([
      categoriesData,
      geographiesData,
      orderSourceData,
      productData
    ]) => {
      const hasSecondaryBookingTimeCities = new Set(
        productData.sku.filter(
          sku => sku.secondary_book_time.time !== null
        ).map(returnRegionalismID)
      );

      return Promise.all(
        [...hasSecondaryBookingTimeCities].map( id => loadDistricts(id) )
      ).then(
        districtsDataGroup => loadEnableCities(productData.product.secondary_cate_id).then(
          enableList => {
            dispatch({
              type: CitiesSelectorActionTypes.LOAD_DATA,
              geographiesData,
              chekcedData: productData.sku.map(returnRegionalismID),
              enableList
            });

            const enableListSet = new Set(enableList.filter(x => x.city_id));
            const citesListSet = new Set(productData.sku.map(returnRegionalismID));
            const hasDifference = [...enableList].filter(x => !citesListSet.has(x)).length > 0;
            const districtsData = {};

            [...hasSecondaryBookingTimeCities].forEach(
              (id, i) => {
                districtsData[id] = districtsDataGroup[i]
              }
            );

            dispatch({
              type: ActionTypes.LOADED_PRODUCT_DATA,
              productId,
              orderSourceData,
              categoriesData,
              citiesSelectorState: clone(getState().citiesSelector),
              productData,
              districtsDataGroup: districtsData,
              isSelectedAllCity: !hasDifference
            });
          }
        )
      );
    })
  }
);

const changeProductName = name => {
  return {
    type: ActionTypes.CHANGE_PRODUCT_NAME,
    name
  };
};

const changeBuyEntry = entry => {
  return {
    type: ActionTypes.CHANGE_BUY_ENTRY,
    entry: Number(entry)
  };
};

const changeSelectedPrimaryCategory = id => (
  (dispatch, getState) => {
    const pid = Number(id);
    const sid = getState().productSKUManagement.secondaryCategories.get(pid)[0].id;

    dispatch({
      type: ActionTypes.CHANGE_SELECTED_PRIMARY_CATEGORY,
      id: Number(pid)
    });

    return changeSelectedSecondaryCategory(sid)(dispatch, getState);
  }
);

const changeSelectedSecondaryCategory = id => (
  (dispatch, getState) => {
    return loadEnableCities(id).then(
      enableList => {
        dispatch({
          type: CitiesSelectorActionTypes.SET_ENABLE_LIST,
          enableList
        });

        dispatch({
          type: CitiesSelectorActionTypes.CHECK_ALL_CITIES
        });

        dispatch({
          type: ActionTypes.CHANGE_SELECTED_SECONDARY_CATEGORY,
          id: Number(id)
        });

        dispatch({
          type: CitiesSelectorActionTypes.CHANGED_CHECK_CITIES,
          citiesSelectorState: clone(getState().citiesSelector)
        });

        return 1;
      }
    );
  }
);

const changeActiveCitiesOption = option => (
  (dispatch, getState) => {
    dispatch({
      type: ActionTypes.CHANGE_ACTIVE_CITIES,
      option: Number(option)
    });

    if (Number(option) === 0) {
      dispatch({
        type: CitiesSelectorActionTypes.CHECK_ALL_CITIES
      });

      dispatch({
        type: CitiesSelectorActionTypes.CHANGED_CHECK_CITIES,
        citiesSelectorState: clone(getState().citiesSelector)
      });
    }
  }
);

const changeCitiesOptionApplyRange = option => {
  return {
    type: ActionTypes.CHANGE_APPLY_RANGE,
    option: Number(option)
  };
}

const changeSelectedProvince = pid => {
  return {
    type: ActionTypes.CHANGE_SELECTED_PROVINCE,
    id: pid
  };
}

const changeSelectedCity = cid => {
  return {
    type: ActionTypes.CHANGE_SELECTED_CITY,
    id: cid
  };
}

// City options

const changePreSaleStatus = () => {
  return {
    type: ActionTypes.CHANGE_PRESALE_STATUS
  };
}

const changePreSaleTime = (beginTime, endTime) => {
  return {
    type: ActionTypes.CHANGE_PRESALE_TIME,
    beginTime,
    endTime
  };
}

const changeDeliveryTime = (beginTime, endTime) => {
  return {
    type: ActionTypes.CHANGE_DELIVERY_TIME,
    beginTime,
    endTime
  }
}

const changeBookingTime = hour => {
  return {
    type: ActionTypes.CHANGE_BOOKING_TIME,
    hour: Number(hour)
  };
}

const changeSecondaryBookingTimeStatus = () => (
  (dispatch, getState) => {
    const state = getState().productSKUManagement;
    const { tempOptions } = state;

    if (state.districtsData.has(tempOptions.selectedCity)) {
      return dispatch({
        type: ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_STATUS
      });
    }

    return loadDistricts(state.selectedCity).then(
      districtsData => {
        dispatch({
          type: ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_STATUS,
          districtsData
        });
      }
    )
  }
);

const changeSecondaryBookingTime = hour => {
  return {
    type: ActionTypes.CHANGE_SECONDARY_BOOKINGTIME,
    hour: Number(hour)
  };
}

const changeSecondaryBookingTimeRange = districtCode => {
  return {
    type: ActionTypes.CHANGE_SECONDARY_BOOKINGTIME_RANGE,
    districtCode
  };
}

const createShopSpecifications = () => {
  return {
    type: ActionTypes.CREATE_SHOP_SPECIFICATIONS
  }
}

const changeShopSpecifications = (index, spec) => {
  return {
    type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS,
    index,
    spec
  }
}

const changeShopSpecificationsOriginalCost = (index, money) => {
  return {
    type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_ORIGINAL_COST,
    index,
    money: transformPrice(money)
  }
}

const changeShopSpecificationsCost = (index, money) => {
  return {
    type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_COST,
    index,
    money: transformPrice(money)
  }
}

const changeShopSpecificationsEventStatus = index => {
  return {
    type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_STATUS,
    index
  }
}

const changeShopSpecificationsEventCost = (index, money) => {
  return {
    type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_COST,
    index,
    money: transformPrice(money)
  }
}

const changeShopSpecificationsEventTime = (index, beginTime, endTime) => {
  return {
    type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS_EVENT_TIME,
    index,
    beginTime,
    endTime
  }
}

const removeShopSpecifications = index => {
  return {
    type: ActionTypes.REMOVE_SHOP_SPECIFICATIONS,
    index
  }
}

const addSource = sourceId => {
  return {
    type: ActionTypes.ADD_SOURCE,
    sourceId: Number(sourceId),
  }
}

const removeSource = sourceId => {
  return {
    type: ActionTypes.REMOVE_SOURCE,
    sourceId: Number(sourceId)
  }
}

const changeSelectedSource = sourceId => (
  (dispatch, getState) => {
    const { sourceSpecifications } = getState().productSKUManagement.tempOptions;

    if (sourceSpecifications.has(sourceId)) {
      dispatch({
        type: ActionTypes.CHANGE_SELECTED_SOURCE,
        sourceId: Number(sourceId),
      });
    }
  }
)

const addSourceSpec = () => {
  return {
    type: ActionTypes.ADD_SOURCE_SPEC
  }
}

const removeSourceSpec = index => {
  return {
    type: ActionTypes.REMOVE_SOURCE_SPEC,
    index
  }
}

const changeSourceSpec = (index, spec) => {
  return {
    type: ActionTypes.CHANGE_SOURCE_SPEC,
    index,
    spec
  }
}

const changeSourceSpecCost = (index, money) => {
  return {
    type: ActionTypes.CHANGE_SOURCE_SPEC_COST,
    index,
    money: transformPrice(money)
  }
}

const resetSpecSet = () => {
  return {
    type: ActionTypes.RESET_SPEC_SET
  }
}

const saveCityOption = () => {
  return {
    type: ActionTypes.SAVE_CITIY_OPTION
  }
}

const resetSaveStatus = () => {
  return {
    type: ActionTypes.RESET_SAVE_STATUS
  }
}

const saveOption = () => (
  (dispatch, getState) => {
    dispatch({
      type: ActionTypes.SAVE_OPTION,
      saveStatus: 'padding'
    });

    const { productSKUManagement, citiesSelector } = getState();
    const state = productSKUManagement;
    const citiesSelectorState = citiesSelector;
    const { addMode } = state;

    let postData = {
      category_id: state.selectSecondaryCategory,
      name: state.productName.trim()
    };

    let newSku = [];
    let editSku = [];
    let deletedSku = state.deletedSku;

    const transformShangjiaOption = option => {
      let transformedOption = {};
      const { onSaleTime, delivery } = option;

      transformedOption = {
        presell_start: dateFormat(onSaleTime[0], 'yyyy-MM-dd hh:mm:ss'),
        send_start: dateFormat(delivery[0], 'yyyy-MM-dd hh:mm:ss')
      }

      if (onSaleTime[1] !== 'Infinite') {
        transformedOption.presell_end = dateFormat(onSaleTime[1], 'yyyy-MM-dd hh:mm:ss')
      }

      if (delivery[1] !== 'Infinite') {
        transformedOption.send_end = dateFormat(delivery[1], 'yyyy-MM-dd hh:mm:ss')
      }

      if (state.citiesOptionApplyRange === 1 && option.hasSecondaryBookingTime) {
        transformedOption.secondary_booktimes = [...option.applyDistrict].map(
          districtCode => ({
            book_time: option.secondaryBookingTime,
            regionalism_id: Number(districtCode)
          })
        );
      }

      return transformedOption;
    };

    const transformShopSpecificationOption = option => {
      let transformedOption = {
        size: option.spec.trim(),
        original_price: parseInt(option.originalCost * 100),
        price: parseInt(option.cost * 100),
        website: 1 // 商城商品，渠道固定为1
      };

      transformedOption.id = option.id;

      if (option.hasEvent) {
        transformedOption = {
          ...transformedOption,
          activity_price: parseInt(option.eventCost * 100),
          activity_start: dateFormat(option.eventTime[0], 'yyyy-MM-dd hh:mm:ss')
        }

        if (option.eventTime[1] !== 'Infinite') {
          transformedOption.activity_end = dateFormat(option.eventTime[1], 'yyyy-MM-dd hh:mm:ss');
        }
      }

      return transformedOption;
    }

    const transformSourceSpecificationOption = ([ sourceId, options ]) => options.map(
      opt => ({
        id: opt.id,
        website: sourceId,
        size: opt.spec.trim(),
        price: parseInt(opt.cost * 100)
      })
    );

    if (state.citiesOptionApplyRange === 0) {

      const shangjiaOpt = state.tempOptions.isPreSale ? transformShangjiaOption(state.tempOptions) : {};
      let sourceSpecifications = [];

      [...state.tempOptions.sourceSpecifications]
        .map(transformSourceSpecificationOption)
        .forEach(srcArr => {
          srcArr.map(
            opt => sourceSpecifications.push({
              ...shangjiaOpt,
              ...opt
            })
          )
        });

      let shopSpecifications = [];

      shopSpecifications = state.tempOptions.shopSpecifications
        .map(transformShopSpecificationOption)
        .map( opt => ({ ...shangjiaOpt, ...opt }) );

      [...citiesSelectorState.checkedCities].forEach(cityId => {
        newSku = [
          ...newSku,
          ...[...shopSpecifications, ...sourceSpecifications].map(
            opt => ({
              regionalism_id: cityId,
              book_time: state.tempOptions.bookingTime,
              ...opt
            })
          )
        ];
      });

      const getDeletedSkuId = opt => {
        if (opt.id && opt.id !== 0) {
          deletedSku.push(opt.id);
        }
      }

      Array.from(state.citiesOptions.values()).forEach(cityOpt => {
        cityOpt.shopSpecifications.forEach(getDeletedSkuId);

        [...cityOpt.sourceSpecifications.values()].forEach(ssArr => {
          ssArr.forEach(getDeletedSkuId);
        });
      });

    } else { // state.citiesOptionApplyRange === 1
      [...state.citiesOptions].forEach(([cityId, cityOption]) => {
        if (cityId === 'all')
          return;

        const shangjiaOpt = cityOption.isPreSale ? transformShangjiaOption(cityOption) : {};
        let sourceSpecifications = [];

        [...cityOption.sourceSpecifications]
          .map(transformSourceSpecificationOption)
          .forEach(srcArr => {
            srcArr.map(
              opt => sourceSpecifications.push({
                ...shangjiaOpt,
                ...opt
              })
            )
          });

        let shopSpecifications = [];

        shopSpecifications = cityOption.shopSpecifications
          .map(transformShopSpecificationOption)
          .map( opt => ({ ...shangjiaOpt, ...opt }) );

        const addCityOption = opt => ({
          regionalism_id: cityId,
          book_time: cityOption.bookingTime,
          ...opt
        });

        const specifications = [...shopSpecifications, ...sourceSpecifications];

        editSku = [...specifications.filter(opt => opt.id !== 0).map(addCityOption), ...editSku];
        newSku = [...specifications.filter(opt => opt.id === 0).map(addCityOption), ...newSku];
      });
    }

    if (addMode) {
      postData = {
        ...postData,
        sku: newSku
      }
    } else {
      postData = {
        product: {
          id: state.productId,
          ...postData
        },
        sku: editSku,
        new_sku: newSku,
        deleted_sku: deletedSku
      }
    }

    return (addMode ? addSku(postData) : saveEditSku(postData)).then(
      () => {
        dispatch({
          type: ActionTypes.SAVE_OPTION,
          saveStatus: 'success'
        });
      }
    ).catch(
      () => {
        dispatch({
          type: ActionTypes.SAVE_OPTION,
          saveStatus: 'failed'
        });
      }
    );
  }
)

export { ActionTypes }

export default {
  loadBasicData,
  changeProductName,
  changeBuyEntry,
  changeSelectedPrimaryCategory,
  changeSelectedSecondaryCategory,
  changeActiveCitiesOption,
  changeCitiesOptionApplyRange,
  changeSelectedProvince,
  changeSelectedCity,

  changePreSaleStatus,
  changePreSaleTime,
  changeDeliveryTime,
  changeBookingTime,
  changeSecondaryBookingTimeStatus,
  changeSecondaryBookingTime,
  changeSecondaryBookingTimeRange,

  createShopSpecifications,
  changeShopSpecifications,
  changeShopSpecificationsOriginalCost,
  changeShopSpecificationsCost,
  changeShopSpecificationsEventStatus,
  changeShopSpecificationsEventCost,
  changeShopSpecificationsEventTime,
  removeShopSpecifications,

  addSource,
  removeSource,
  changeSelectedSource,
  addSourceSpec,
  removeSourceSpec,
  changeSourceSpec,
  changeSourceSpecCost,

  resetSpecSet,

  saveCityOption,
  resetSaveStatus,
  saveOption
}