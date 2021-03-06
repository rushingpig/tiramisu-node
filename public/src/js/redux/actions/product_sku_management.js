import Req from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat } from 'utils/index';

import { ActionTypes as CitiesSelectorActionTypes } from './cities_selector';

const ActionTypes = {
  LOADED_BASIC_DATA:   Symbol('LOADED_BASIC_DATA'),
  LOADED_PRODUCT_DATA: Symbol('LOADED_PRODUCT_DATA'),

  CHANGE_PRODUCT_NAME:                Symbol('CHANGE_PRODUCT_NAME'),
  CHANGE_PRODUCT_DISPLAY_NAME:        Symbol('CHANGE_PRODUCT_DISPLAY_NAME'),
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

  ADD_SHOP_SPECIFICATIONS:                  Symbol('ADD_SHOP_SPECIFICATIONS'),
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

// 接口封装
const loadCategories         = () => get(Url.categories.toString());
const loadAllGeographiesData = () => get(Url.allGeographies.toString());
const loadOrderSource        = () => get(Url.order_srcs.toString());
const loadEnableCities       = id => get(Url.activatedCity.toString(id));
const loadDistricts          = id => get(Url.districts.toString(id));
const loadAllSkuSize         = () => get(Url.getAllSkuSize.toString());
const addSku                 = postData => post(Url.addSku.toString(), postData);
const getSku                 = id => get(Url.getSku.toString(), { productId: id });
const saveEditSku            = putData => put(Url.saveEditSku.toString(), putData);
const getCityInfo            = id => get(Url.open_city_detail.toString(id));

// 金额转换
const transformPrice = num => {
  let money = Number(num) || 0.01

  if (money < 0)
    money = 0.01

  return Math.trunc(money * 100) / 100
}

// 获取默认
const getDefaultBookingTime = regionID => getCityInfo(regionID).then(
  info => ({
    bookingTime: (Number(info.order_time) || 0)/60,
    secondaryBookingTime: (Number(info.second_order_time) || 0)/60
  })
);

const returnRegionalismID = obj => obj.regionalism_id;

const loadBasicData = (productId = 0) => (
  (dispatch, getState) => {
    dispatch({ type: CitiesSelectorActionTypes.RESET_SELECTOR });

    if (productId === 0) {
      return Promise.all([
        loadCategories(),
        loadAllGeographiesData(),
        loadOrderSource(),
        loadAllSkuSize()
      ]).then(([
        categoriesData,
        geographiesData,
        orderSourceData,
        skuSizeData
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
              orderSourceData,
              skuSizeData
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
      getSku(productId),
      loadAllSkuSize()
    ]).then(([
      categoriesData,
      geographiesData,
      orderSourceData,
      productData,
      skuSizeData
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
              isSelectedAllCity: !hasDifference,
              skuSizeData
            });
          }
        )
      );
    })
  }
);

// 修改商品名
const changeProductName = name => {
  return {
    type: ActionTypes.CHANGE_PRODUCT_NAME,
    name
  };
};

// 修改商品商城展示名
const changeProductDisplayName = name => {
  return {
    type: ActionTypes.CHANGE_PRODUCT_DISPLAY_NAME,
    name
  };
};

// 切换购买方式
const changeBuyEntry = entry => {
  return {
    type: ActionTypes.CHANGE_BUY_ENTRY,
    entry: Number(entry)
  };
};

// 修改一级分类
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

// 修改二级分类
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

// 切换上线城市
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
    }else{
      dispatch({
        type: CitiesSelectorActionTypes.RESTORE_CHECKED_CITIES
      })
    }
    dispatch({
      type: CitiesSelectorActionTypes.CHANGED_CHECK_CITIES,
      citiesSelectorState: clone(getState().citiesSelector),
      isSelectedAllCity: Number(option) === 0
    });
  }
);

// 切换城市配置应用范围
const changeCitiesOptionApplyRange = option => (
  (dispatch, getState) => {

    if (option === 0) {
      return dispatch({
        type: ActionTypes.CHANGE_APPLY_RANGE,
        option: Number(option)
      });
    }

    const state = getState().productSKUManagement;

    if (state.citiesOptions.has(state.selectedCity)) {
      return dispatch({
        type: ActionTypes.CHANGE_APPLY_RANGE,
        option: Number(option)
      });
    }

    return getDefaultBookingTime(state.selectedCity).then(
      defaultBookingTime => dispatch({
        type: ActionTypes.CHANGE_APPLY_RANGE,
        option: Number(option),
        defaultBookingTime
      })
    );
  }
)

// 切换选中的省份
const changeSelectedProvince = pid => (
  (dispatch, getState) => {
    const state = getState().productSKUManagement;
    let selectedCity;

    if (state.selectedProvince === pid) {
      return;
    }

    [...state.provincesData.get(pid).list].some(cid => {
      if (state.citiesData.has(cid)) {
        selectedCity = cid;
        return true;
      }

      return false;
    });

    const cityDataHasStash = state.citiesOptions.has(selectedCity);
    const hasDistrictData = state.districtsData.has(selectedCity);
    const firstCityOptionHasSecondaryBookingTime = state.citiesOptions.size > 0 && [...state.citiesOptions.values()][0].hasSecondaryBookingTime;

    if (!cityDataHasStash) {
      return getDefaultBookingTime(selectedCity).then(defaultBookingTime => {
        if (hasDistrictData || !firstCityOptionHasSecondaryBookingTime) {
          return dispatch({
            type: ActionTypes.CHANGE_SELECTED_PROVINCE,
            pid,
            cid: selectedCity,
            defaultBookingTime
          });
        }

        return loadDistricts(selectedCity).then(
          districtsData => dispatch({
            type: ActionTypes.CHANGE_SELECTED_PROVINCE,
            pid,
            cid: selectedCity,
            districtsData,
            defaultBookingTime
          })
        );
      });
    }

    if (cityDataHasStash || hasDistrictData || !firstCityOptionHasSecondaryBookingTime) {
      return dispatch({
        type: ActionTypes.CHANGE_SELECTED_PROVINCE,
        pid,
        cid: selectedCity
      });
    }

    return loadDistricts(selectedCity).then(
      districtsData => dispatch({
        type: ActionTypes.CHANGE_SELECTED_PROVINCE,
        pid,
        cid: selectedCity,
        districtsData
      })
    );
  }
);

// 切换选中的城市
const changeSelectedCity = id => (
  (dispatch, getState) => {
    const state = getState().productSKUManagement;

    if (state.selectedCity === id) {
      return;
    }

    if (state.citiesOptions.has(id)) {
      return dispatch({
        type: ActionTypes.CHANGE_SELECTED_CITY,
        id
      });
    }

    return Promise.all([
      getDefaultBookingTime(id),
      loadDistricts(id)
    ]).then(([
      defaultBookingTime,
      districtsData
    ]) => dispatch({
      type: ActionTypes.CHANGE_SELECTED_CITY,
      id,
      districtsData,
      defaultBookingTime
    }));
  }
);

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
    type: ActionTypes.ADD_SHOP_SPECIFICATIONS
  }
}

const changeShopSpecifications = (index, specInfo) => {
  return {
    type: ActionTypes.CHANGE_SHOP_SPECIFICATIONS,
    index,
    spec: specInfo.text,
    spec_id: specInfo.id,
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

const changeSourceSpec = (index, specInfo) => {
  return {
    type: ActionTypes.CHANGE_SOURCE_SPEC,
    index,
    spec: specInfo.text,
    spec_id : specInfo.id,
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
      name: state.productName.trim(),
      display_name: state.productDisplayName.trim(),
    };

    let newSku = [];
    let editSku = [];
    // let deletedSku = state.deletedSku;
    let deletedSku = [];

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

      return transformedOption;
    };

    const getDeletedSkuIds = function(deletedSkus){
      var d = [];
      const getDeletedSkuId = opt => {
        if (opt.id && opt.id !== 0) {
          d.push(opt.id);
        }
      }

      deletedSkus.forEach(([cityId, cityOption]) => {
        cityOption.shopSpecifications.forEach(getDeletedSkuId);

        [...cityOption.sourceSpecifications.values()].forEach(ssArr => {
          ssArr.forEach(getDeletedSkuId);
        });
      });
      return d;
    }

    const transformShopSpecificationOption = option => {
      let transformedOption = {
        size: option.spec.trim(),
        size_id: option.spec_id,
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
        size_id: opt.spec_id,
        price: parseInt(opt.cost * 100)
      })
    );

    const getDeletedSkuId = opt => {
      if (opt.id && opt.id !== 0) {
        deletedSku.push(opt.id);
      }
    }

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

        //2016-09-26 revised xionghong 外部渠道可购买时，去掉商城规格设置
        let specifications = [];
        if(state.buyEntry === 1){
          shopSpecifications.forEach(getDeletedSkuId);
          specifications = sourceSpecifications;
        }else{
          specifications = [...shopSpecifications, ...sourceSpecifications];
        }
        //end

      [...citiesSelectorState.checkedCities].forEach(cityId => {
        newSku = [
          ...newSku,
          ...specifications.map(
            opt => ({
              regionalism_id: cityId,
              book_time: state.tempOptions.bookingTime,
              ...opt
            })
          )
        ];
      });

      // const getDeletedSkuId = opt => {
      //   if (opt.id && opt.id !== 0) {
      //     deletedSku.push(opt.id);
      //   }
      // }

      // Array.from(state.citiesOptions.values()).forEach(cityOpt => {
      //   cityOpt.shopSpecifications.forEach(getDeletedSkuId);
      //   [...cityOpt.sourceSpecifications.values()].forEach(ssArr => {
      //     ssArr.forEach(getDeletedSkuId);
      //   });
      // });

    } else { // state.citiesOptionApplyRange === 1
      let checkedCities = [...citiesSelectorState.checkedCities];
      let newSelectedCities = [];

      [...state.citiesOptions].forEach(([cityId, cityOption]) => {
        if(checkedCities.some(id => id == cityId)){
          newSelectedCities.push([cityId, cityOption]);
        }else{
          deletedSku.push([cityId, cityOption]);
        }
      })

      deletedSku = getDeletedSkuIds(deletedSku);

      newSelectedCities
        .forEach(([cityId, cityOption]) => {
          if (cityId === 'all')
            return;

          const shangjiaOpt = cityOption.isPreSale ? transformShangjiaOption(cityOption) : {};

          if (state.citiesOptionApplyRange === 1 && cityOption.hasSecondaryBookingTime) {
            shangjiaOpt.secondary_booktimes = [...cityOption.applyDistrict].map(
              districtCode => ({
                book_time: cityOption.secondaryBookingTime,
                regionalism_id: Number(districtCode)
              })
            );
          }

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

          //2016-09-26 revised xionghong 外部渠道可购买时，去掉商城规格设置
          let specifications = []
          if(state.buyEntry === 1){
            shopSpecifications.forEach(getDeletedSkuId);
            specifications = sourceSpecifications;
          }else{
            specifications = [...shopSpecifications, ...sourceSpecifications];
          }
          //end
          
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

    // return $.Deferred().resolve();
    return (addMode ? addSku(postData) : saveEditSku(postData)).then(
      (data) => {
        dispatch({
          type: ActionTypes.SAVE_OPTION,
          saveStatus: 'success',
          newProductId: addMode ? data.productId : undefined,
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
  // {
  //   saveStatus: 'success',
  //   newProductId: 593,
  //   type: ActionTypes.SAVE_OPTION
  // }
)

export { ActionTypes }

export default {
  loadBasicData,
  changeProductName,
  changeProductDisplayName,
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