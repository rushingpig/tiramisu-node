import Req from 'utils/request';
import Url from 'config/url';
import { clone, dateFormat } from 'utils/index';

const ActionTypes = {
  LOAD_BASIC_DATA:                  Symbol('LOAD_BASIC_DATA'),
  SEARCH_PRODCUT:                   Symbol('SEARCH_PRODCUT'),
  
  CHANGE_SEARCH_PRODUCT_NAME:       Symbol('CHANGE_SEARCH_PRODUCT_NAME'),
  CHANGE_SEARCH_BEGIN_TIME:         Symbol('CHANGE_SEARCH_BEGIN_TIME'),
  CHANGE_SEARCH_END_TIME:           Symbol('CHANGE_SEARCH_END_TIME'),
  CHANGE_NO_END_TIME_LIMIT:         Symbol('CHANGE_NO_END_TIME_LIMIT'),
  CHANGE_SELECT_PRIMARY_CATEGORY:   Symbol('CHANGE_SELECT_PRIMARY_CATEGORY'),
  CHANGE_SELECT_SECONDARY_CATEGORY: Symbol('CHANGE_SELECT_SECONDARY_CATEGORY'),
  CHANGE_SELECT_PROVINCE:           Symbol('CHANGE_SELECT_PROVINCE'),
  CHANGE_SELECT_CITY:               Symbol('CHANGE_SELECT_CITY'),
  CHANGE_WEBSITE_ONSALE_STATUS:     Symbol('CHANGE_WEBSITE_ONSALE_STATUS'),
  CHANGE_SEARCH_IS_EVENT_STATUS:    Symbol('CHANGE_SEARCH_IS_EVENT_STATUS'),
  
  SELECT_SEARCH_RESULT_ROW:         Symbol('SELECT_SEARCH_RESULT_ROW'),
  SELECT_ALL_ROW:                   Symbol('SELECT_ALL_ROW'),
  DESELECT_ALL_ROW:                 Symbol('DESELECT_ALL_ROW'),
  
  DELETE_ROW:                       Symbol("DELETE_ROW"),
}

const es6promisify = function(func) {
  return function(...args) {
    let ctx = this;
    return new Promise((resolve, reject) => {
      func.apply(ctx, args).done(resolve).fail(reject);
    });
  }
};

const get = es6promisify(Req.get);
const put = es6promisify(Req.put);

const loadCategories = () => get(Url.categories.toString());
const loadProvinces  = () => get(Url.provinces.toString());
const loadCitiesData = id => get(Url.cities.toString(id));
const search         = filter => get(Url.searchSku.toString(), filter);
const deleteProduct  = list => put(Url.deleteSku.toString(), list);

const loadBasicData = () => (
  (dispatch, getState) => {
    dispatch({
      type: ActionTypes.LOAD_BASIC_DATA,
      status: 'pending'
    });

    return Promise.all([
      loadCategories(),
      loadProvinces()
    ]).then(([
      categoriesData,
      provincesData
    ]) => {
      // 默认加载广东省的城市
      return loadCitiesData(440000).then(
        citiesData => {
          dispatch({
            type: ActionTypes.LOAD_BASIC_DATA,
            status: 'success',
            categoriesData,
            provincesData,
            citiesData
          });

          searchWithFilter()(dispatch, getState);
        }
      )
    }).catch(e => dispatch({
      type: ActionTypes.LOAD_BASIC_DATA,
      status: 'failed',
      e
    }));
  }
)

const changeSearchProductName = name => {
  return {
    type: ActionTypes.CHANGE_SEARCH_PRODUCT_NAME,
    name
  }
}

const changeSearchBeginTime = time => {
  return {
    type: ActionTypes.CHANGE_SEARCH_BEGIN_TIME,
    time: time
  }
}

const changeSearchEndTime = time => {
  return {
    type: ActionTypes.CHANGE_SEARCH_END_TIME,
    time: time
  }
}

const changeNoEndTimeLimit = () => {
  return {
    type: ActionTypes.CHANGE_NO_END_TIME_LIMIT
  }
}

const changeSelectPrimaryCategory = id => {
  return {
    type: ActionTypes.CHANGE_SELECT_PRIMARY_CATEGORY,
    id: Number(id)
  }
}

const changeSelectSecondaryCategory = id => {
  return {
    type: ActionTypes.CHANGE_SELECT_SECONDARY_CATEGORY,
    id: Number(id)
  }
}

const changeSelectProvince = pid => (
  (dispatch, getState) => {

    const { citiesList } = getState().productSKUSearch;

    if (pid in citiesList) {
      return dispatch({
        type: ActionTypes.CHANGE_SELECT_PROVINCE,
        pid: Number(pid)
      });
    }

    return loadCitiesData(pid).then(
      citiesData => dispatch({
        type: ActionTypes.CHANGE_SELECT_PROVINCE,
        pid: Number(pid),
        citiesData
      })
    );
  }
)

const changeSelectCity = cid => {
  return {
    type: ActionTypes.CHANGE_SELECT_CITY,
    cid: Number(cid)
  }
}

const changeSearchActiveStatus = () => {
  return {
    type: ActionTypes.CHANGE_WEBSITE_ONSALE_STATUS
  }
}

const changeSearchIsEventStatus = () => {
  return {
    type: ActionTypes.CHANGE_SEARCH_IS_EVENT_STATUS
  }
}

const searchWithProductName = (pageNum = 0, isPageChange = false) => (
  (dispatch, getState) => {
    dispatch({
      type: ActionTypes.SEARCH_PRODCUT,
      status: 'pending'
    });

    const state = getState().productSKUSearch;
    const filterSrc = isPageChange ? state.lastSearchFilter : state;

    const filter = {
      name: filterSrc.searchProductName,
      pageno: pageNum,
      pagesize: state.pageSize
    }

    return search(filter).then(result => dispatch({
      type: ActionTypes.SEARCH_PRODCUT,
      status: 'success',
      searchWithProductName: true,
      result,
      pageNum,
      isPageChange
    })).catch(e => dispatch({
      type: ActionTypes.SEARCH_PRODCUT,
      status: 'failed'
    }));
  }
)

const searchWithFilter = (pageNum = 0, isPageChange = false) => (
  (dispatch, getState) => {
    dispatch({
      type: ActionTypes.SEARCH_PRODCUT,
      status: 'pending'
    });

    const state = getState().productSKUSearch;
    const filterSrc = isPageChange ? state.lastSearchFilter : state;

    const filter = {
      ...filterSrc.searchProductName.trim() === '' ? {} : {name: filterSrc.searchProductName},
      presell_start: filterSrc.searchBeginTime + ' 00:00:00',
      ...filterSrc.noEndTimeLimit ? {} : {
        presell_end: filterSrc.searchEndTime + ' 23:59:59'
      },
      ...filterSrc.selectedProvince === 0 ? {} : {province: filterSrc.selectedProvince},
      ...filterSrc.selectedCity === 0 ? {} : {city: filterSrc.selectedCity},
      ...filterSrc.selectedPrimaryCategory === 0 ? {} : {primary_cate: filterSrc.selectedPrimaryCategory},
      ...filterSrc.selectedSecondaryCategory === 0 ? {} : {secondary_cate: filterSrc.selectedSecondaryCategory},
      isActivity: filterSrc.searchIsEvent ? 1 : 0,
      isMall: filterSrc.searchHasActive ? 1 : 0,
      pageno: pageNum,
      pagesize: state.pageSize
    }

    return search(filter).then(result => dispatch({
      type: ActionTypes.SEARCH_PRODCUT,
      status: 'success',
      searchWithProductName: false,
      result,
      pageNum,
      isPageChange
    })).catch(e => dispatch({
      type: ActionTypes.SEARCH_PRODCUT,
      status: 'failed'
    }));
  }
)

const searchWithLastSearchFilter = (pageNum) => (
  (dispatch, getState) => {
    dispatch({
      type: ActionTypes.SEARCH_PRODCUT,
      status: 'pending'
    });

    const state = getState().productSKUSearch;
    const filterSrc = state.lastSearchFilter;

    const filter = state.searchWithProductName ? { name: filterSrc.searchProductName } : {
      ...filterSrc.searchProductName.trim() === '' ? {} : {name: filterSrc.searchProductName},
      presell_start: filterSrc.searchBeginTime + ' 00:00:00',
      ...filterSrc.noEndTimeLimit ? {} : {
        presell_end: filterSrc.searchEndTime + ' 23:59:59'
      },
      ...filterSrc.selectedProvince === 0 ? {} : {province: filterSrc.selectedProvince},
      ...filterSrc.selectedCity === 0 ? {} : {city: filterSrc.selectedCity},
      ...filterSrc.selectedPrimaryCategory === 0 ? {} : {primary_cate: filterSrc.selectedPrimaryCategory},
      ...filterSrc.selectedSecondaryCategory === 0 ? {} : {secondary_cate: filterSrc.selectedSecondaryCategory},
      isActivity: filterSrc.searchIsEvent ? 1 : 0,
      isMall: filterSrc.searchHasActive ? 1 : 0,
      pageno: !!pageNum? pageNum : filterSrc.pageNum,
      pagesize: state.pageSize
    }

    return search(filter).then(result => dispatch({
      type: ActionTypes.SEARCH_PRODCUT,
      status: 'success',
      searchWithProductName: state.searchWithProductName,
      result,
      pageNum: !!pageNum ? pageNum: filterSrc.pageNum,
      isPageChange: false
    })).catch(e => dispatch({
      type: ActionTypes.SEARCH_PRODCUT,
      status: 'failed'
    }));
  }
)

const selectRow = index => {
  return {
    type: ActionTypes.SELECT_SEARCH_RESULT_ROW,
    index
  }
}

const deselectAllRow = () => {
  return {
    type: ActionTypes.DESELECT_ALL_ROW
  }
}

const selectAllRow = () => {
  return {
    type: ActionTypes.SELECT_ALL_ROW
  }
}

const deleteRow = (reset = false, isMultiRow = false, deleteIndex = 0) => (
  (dispatch, getState) => {
    if (reset) {
      return dispatch({
        type: ActionTypes.DELETE_ROW,
        status: 'normal'
      });
    }

    dispatch({
      type: ActionTypes.DELETE_ROW,
      status: 'pending'
    });

    const { searchResult, checkedRow } = getState().productSKUSearch;

    const deleteList = isMultiRow ? [...checkedRow].map(
      index => ({
        city: searchResult[index].city_id || 0,
        spu: searchResult[index].spu
      })
    ) : [{
      city: searchResult[deleteIndex].city_id || 0,
      spu: searchResult[deleteIndex].spu
    }];

    return deleteProduct(deleteList).then(
      () =>{
      //2016-09-26 revised xiaohong,删除一些列后，重新拉取列表
       var { pageNum, totalItem, pageSize} = getState().productSKUSearch;
       var deleteCount = isMultiRow ?  deleteList.length : 1;
       if( (pageNum * pageSize + deleteCount) === totalItem){
        if(pageNum != 0)
          searchWithLastSearchFilter(pageNum -1 )(dispatch, getState)
       }else{
          searchWithLastSearchFilter(pageNum)(dispatch, getState)
       }
       //end
       dispatch({
        type: ActionTypes.DELETE_ROW,
        status: 'success',
        deletedIndex: isMultiRow ? -1 : deleteIndex
      })
     }
    ).catch(
      e => dispatch({
        type: ActionTypes.DELETE_ROW,
        status: 'failed',
      })
    );
  }
);

export { ActionTypes }
export { searchWithLastSearchFilter }
export default {
  loadBasicData,
  changeSearchProductName,
  changeSearchBeginTime,
  changeSearchEndTime,
  changeNoEndTimeLimit,
  changeSelectPrimaryCategory,
  changeSelectSecondaryCategory,
  changeSelectProvince,
  changeSelectCity,
  changeSearchActiveStatus,
  changeSearchIsEventStatus,
  searchWithProductName,
  searchWithFilter,
  searchWithLastSearchFilter,
  selectRow,
  selectAllRow,
  deselectAllRow,
  deleteRow
}