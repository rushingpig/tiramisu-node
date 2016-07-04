import { ActionTypes } from 'actions/product_sku_search';
import Util from 'utils/index';

const now = new Date();

const initialState = {
  basicDataLoadStatus: 'pending',

  categoriesList: [],
  provincesList: [],
  citiesList: [],

  searchProductName: '',
  searchBeginTime: "2016-01-01",
  noEndTimeLimit: false,
  searchEndTime: Util.getDate(30),
  selectedPrimaryCategory: 0,
  selectedSecondaryCategory: 0,
  selectedProvince: 0,
  selectedCity: 0,
  searchIsEvent: false,
  searchHasActive: false,
  searchWithProductName: false,

  pageNum: 0,
  totalItem: 0,
  pageSize: 10,

  lastSearchFilter: {},
  searching: false,
  searchResult: [],
  checkedRow: new Set(),

  deleteStatus: 'normal'
};

const switchType = {
  [ActionTypes.LOAD_BASIC_DATA]: (state, data) => {
    const {
      status = 'pending',
      categoriesData,
      provincesData,
      citiesData
    } = data;

    if (status === 'pending') {
      state.basicDataLoadStatus = 'pending';
    } else if (status === 'failed') {
      state.basicDataLoadStatus = 'failed';
    } else {
      const categoriesList = categoriesData;
      const provincesList = Object.keys(provincesData).map(
        pid => ({
          id: pid,
          name: provincesData[pid]
        })
      );
      const citiesList = {
        [440000]: Object.keys(citiesData).map(
          cid => ({
            id: cid,
            name: citiesData[cid]
          })
        )
      }

      return {
        ...state,
        basicDataLoadStatus: 'success',
        // 默认选择广东省、深圳市
        selectedProvince: 440000,
        selectedCity: 440300,
        categoriesList,
        provincesList,
        citiesList
      }
    }

    return state;
  },

  [ActionTypes.CHANGE_SEARCH_PRODUCT_NAME]: (state, { name }) => {
    return {
      ...state,
      searchProductName: name
    };
  },

  [ActionTypes.CHANGE_SEARCH_BEGIN_TIME]: (state, { time }) => {
    return {
      ...state,
      searchBeginTime: time
    };
  },

  [ActionTypes.CHANGE_SEARCH_END_TIME]: (state, { time }) => {
    return {
      ...state,
      searchEndTime: time
    };
  },

  [ActionTypes.CHANGE_SELECT_PRIMARY_CATEGORY]: (state, { id }) => {
    return {
      ...state,
      selectedPrimaryCategory: id,
      selectedSecondaryCategory: 0
    };
  },

  [ActionTypes.CHANGE_SELECT_SECONDARY_CATEGORY]: (state, { id }) => {
    return {
      ...state,
      selectedSecondaryCategory: id
    };
  },

  [ActionTypes.CHANGE_SELECT_PROVINCE]: (state, { pid, citiesData }) => {
    if (pid in state.citiesList) {
      return {
        ...state,
        selectedProvince: pid,
        selectedCity: 0
      };
    }

    state.citiesList[pid] = Object.keys(citiesData).map(
      cid => ({
        id: cid,
        name: citiesData[cid]
      })
    )

    return {
      ...state,
      selectedProvince: pid,
      selectedCity: 0
    }
  },

  [ActionTypes.CHANGE_SELECT_CITY]: (state, { cid }) => {
    return {
      ...state,
      selectedCity: cid
    };
  },

  [ActionTypes.CHANGE_WEBSITE_ONSALE_STATUS]: state => {
    state.searchIsEvent = !state.searchIsEvent;

    return state;
  },

  [ActionTypes.CHANGE_SEARCH_IS_EVENT_STATUS]: state => {
    state.searchHasActive = !state.searchHasActive;

    return state;
  },

  [ActionTypes.CHANGE_NO_END_TIME_LIMIT]: state => {
    return {
      ...state,
      noEndTimeLimit: !state.noEndTimeLimit
    }
  },

  [ActionTypes.SEARCH_PRODCUT]: (state, { status = 'pending', searchWithProductName, result = [], pageNum = 0, isPageChange = false }) => {
    if (status === 'success') {
      const lastSearchFilter = searchWithProductName ? {
        searchProductName: state.searchProductName
      } : {
        noEndTimeLimit: state.noEndTimeLimit,
        searchProductName: state.searchProductName,
        searchBeginTime: state.searchBeginTime,
        searchEndTime: state.searchEndTime,
        selectedPrimaryCategory: state.selectedPrimaryCategory,
        selectedSecondaryCategory: state.selectedSecondaryCategory,
        selectedProvince: state.selectedProvince,
        selectedCity: state.selectedCity,
        searchIsEvent: state.searchIsEvent,
        searchHasActive: state.searchHasActive,
        pageNum
      }

      return {
        ...state,
        ...isPageChange ? {} : {lastSearchFilter: Util.clone(lastSearchFilter)},
        searching: false,
        searchWithProductName,
        searchResult: result.products,
        checkedRow: new Set(),
        pageNum,
        totalItem: result.count
      }
    }

    return {
      ...state,
      searching: true
    }
  },

  [ActionTypes.SELECT_SEARCH_RESULT_ROW]: (state, { index }) => {
    state.checkedRow.has(index) ? state.checkedRow.delete(index) : state.checkedRow.add(index);
    return state;
  },

  [ActionTypes.SELECT_ALL_ROW]: state => {
    if (state.checkedRow.size > 0 && (state.checkedRow.size === state.searchResult.length)) {
      state.checkedRow = new Set();
    } else {
      state.searchResult.forEach((r, i) => {
        state.checkedRow.add(i);
      });
    }

    return state;
  },

  [ActionTypes.DESELECT_ALL_ROW]: state => {
    state.checkedRow = new Set();

    return state;
  },

  [ActionTypes.DELETE_ROW]: (state, { status = 'normal', deletedIndex = -1 }) => {

    if (status === 'success') {

      if (deletedIndex >= 0) {
        state.searchResult.splice(deletedIndex, 1);
      } else {
        state.searchResult = state.searchResult.filter(
          (x, index) => !state.checkedRow.has(index)
        );
        state.checkedRow = new Set();
      }

      return state;
    }

    return {
      ...state,
      deleteStatus: status
    }
  },

}

const productSKUSearch = (state = initialState, action) => action.type in switchType
? switchType[action.type](Util.clone(state), action)
: state;

export default productSKUSearch;