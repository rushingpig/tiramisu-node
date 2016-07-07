import Immutable from 'immutable';
import { Search as ActionTypes } from 'actions/category_action_types';

const initialState = Immutable.fromJS({

  firstCategoriesList: [],
  secondCategoriesList: [],
  provincesList: [],
  citiesList: [],

  basicDataLoadStatus: 'pending',
  citiesListLoadStatus: 'pending',

  selectedFirstCategory: 0,
  selectedSecondCategory: 0,
  selectedProvince: 0,
  selectedCity: 0,

  searchState: "success",
  searchResult: [],
  searchCity: 0,

  comment: '',
  showActiveCities: 0,

  sortable: false,

  willTranslateFirstCategory: 0,
  willTranslateSecondCategory: 0,

  deleteCategoryState: 'normal',

  searchWithName: false,
  lastSearchFilter: undefined
});

const allProvinceOption = { id: 0, name: '所有省份' };
const allCitiesOption   = { id: 0, name: '所有城市' };

const fillSearchResult = source => {
  let primaryCategoriesMap = {};

  source.forEach((category, i) => {
    if (!(category.primary_id in primaryCategoriesMap)) {
      primaryCategoriesMap[category.primary_id] = {
        id: category.primary_id,
        name: category.primary_name,
        index: category.primary_sort || i,
        list: []
      }
    }

    primaryCategoriesMap[category.primary_id].list.push({
      id: category.secondary_id,
      name: category.secondary_name,
      count: category.count,
      index: category.secondary_sort || i
    });
  });

  let sortedPrimaryCategoriesMap = {};
  let plus1 = 0;

  Object.keys(primaryCategoriesMap).forEach(key => {

    const primaryCategory = primaryCategoriesMap[key];
    let sortedSecondaryCategoriesMap = {};
    let plus2 = 0;

    primaryCategory.list.forEach(secondaryCategory => {
      if (secondaryCategory.index in sortedSecondaryCategoriesMap) {
        sortedSecondaryCategoriesMap[String(secondaryCategory.index) + String(++plus2)] = secondaryCategory;
      } else {
        sortedSecondaryCategoriesMap[String(secondaryCategory.index)] = secondaryCategory;
      }
    });
    primaryCategory.list = Object.keys(sortedSecondaryCategoriesMap).map(
      index => sortedSecondaryCategoriesMap[index]
    );

    if (primaryCategory.index in sortedPrimaryCategoriesMap) {
      sortedPrimaryCategoriesMap[String(primaryCategory.index) + String(++plus1)] = primaryCategory;      
    } else {
      sortedPrimaryCategoriesMap[String(primaryCategory.index)] = primaryCategory;
    }
  });

  sortedPrimaryCategoriesMap = Object.keys(sortedPrimaryCategoriesMap).map(index => sortedPrimaryCategoriesMap[index]);

  return sortedPrimaryCategoriesMap;
};

const switchType = {

  // 请求基础数据
  [ActionTypes.LOAD_BASIC_DATA]: (state, data = {}) => {
    let {
      status,
      categoriesData = [],
      provincesData = {}
    } = data;

    switch (status) {
      case 'pending':
        return state.set('basicDataLoadStatus', 'pending');
      case 'success':
        const citiesList = [allCitiesOption];

        categoriesData = Immutable.fromJS({
          firstCategoriesList: categoriesData.filter(obj => obj.parent_id === 0),
          secondCategoriesList: categoriesData.filter(
            obj => obj.parent_id !== 0
          ).map(
            obj => ({
              id: obj.id,
              name: obj.name,
              parentId: obj.parent_id
            })
          ),
          selectedSecondCategory: 0
        });

        categoriesData = categoriesData.update(
          'firstCategoriesList',
          list => list.unshift(Immutable.Map({
            id: 0,
            name: '全部分类',
            parentId: 0
          }))
        );

        categoriesData = categoriesData.update(
          'secondCategoriesList',
          list => list.unshift(
            Immutable.Map({
              id: 0,
              name: '全部二级分类',
              parentId: 0
            })
          )
        );

        provincesData = Object.keys(provincesData).map(
          key => ({
            id: Number(key),
            name: provincesData[key]
          })
        );

        provincesData.unshift({
          id: 0,
          name: '所有省份'
        });

        provincesData = Immutable.fromJS({
          provincesList: provincesData,
          citiesList,
          selectedProvince: 0,
          selectedCity: 0
        });

        status = Immutable.fromJS({
          citiesListLoadStatus: 'success',
          basicDataLoadStatus: 'success'
        });

        return state.merge(categoriesData).merge(provincesData).merge(status)
      case 'failed':
        return state.set('basicDataLoadStatus', 'failed');
      default:
        console.error('Unknow load status:', status);
        return state;
    }
  },

  [ActionTypes.SELECTED_DATA_PROVINCE]: (state, { provinceId }) => {
    const newData = {
      selectedProvince: provinceId,
      citiesListLoadStatus: 'pending'
    };

    return state.merge(newData);
  },

  [ActionTypes.LOADED_CITIES_DATA]: (state, { status, citiesData }) => {
    citiesData = Object.keys(citiesData).map(
      key => ({
        id: Number(key),
        name: citiesData[key]
      })
    );

    citiesData.unshift(allCitiesOption);

    const newData = Immutable.fromJS({
      citiesListLoadStatus: 'success',
      citiesList: citiesData,
      selectedCity: 0
    });

    return state.merge(newData);
  },

  // 更改搜索条件
  [ActionTypes.SELECTED_DATA_FIRST_CATEGORY]: (state, { id }) => {

    let firstCategoryName;

    state.get('firstCategoriesList').some(category => {
      firstCategoryName = category.get('name');
      return category.get('id') === id;
    });

    let newSecondCategoriesList = state.get('secondCategoriesList');
    newSecondCategoriesList = newSecondCategoriesList.update(0,
      category => Immutable.Map({
        id: category.get('id'),
        name: id === 0 ? '全部二级分类' : ('全部' + firstCategoryName),
        parentId: id
      })
    );

    const newData = {
      selectedFirstCategory: id,
      secondCategoriesList:  newSecondCategoriesList
    };

    return state.merge(newData);
  },
  [ActionTypes.SELECTED_DATA_SECOND_CATEGORY]: (state, { id }) => {
    return state.set('selectedSecondCategory', id);
  },
  [ActionTypes.SELECTED_DATA_CITY]: (state, { cityId }) => {
    return state.set('selectedCity', cityId);
  },

  // 按条件搜索
  [ActionTypes.SEARCH_CATEGORY_WAITING]: state => {
    return state.set('searchState', 'pending');
  },
  [ActionTypes.SEARCH_CATEGORY_SUCCESS]: (state, { data = [], sortable = false }) => {

    const selectedCity = state.get('selectedCity');
    const searchResult = fillSearchResult(data);

    const newData = Immutable.fromJS({
      searchResult,
      searchState: 'success',
      searchCity: selectedCity !== 0 ? selectedCity : 0,
      sortable: selectedCity !== 0, // 必须要按照城市搜索，才允许修改排序
      lastSearchFilter: {
        selectedCity:           state.get('selectedCity'),
        selectedFirstCategory:  state.get('selectedFirstCategory'),
        selectedProvince:       state.get('selectedProvince'),
        selectedSecondCategory: state.get('selectedSecondCategory')
      },
      searchWithName: false
    });

    return state.merge(newData);
  },
  [ActionTypes.SEARCH_CATEGORY_FAIL]: state => {
    return state.set('searchState', 'failed');
  },

  // 用名称搜索分类
  [ActionTypes.SEARCH_CATEGORY_WITH_NAME_WAITING]: state => {
    return state.set('searchState', 'pending');
  },
  [ActionTypes.SEARCH_CATEGORY_WITH_NAME_SUCCESS]: (state, { data = [], name }) => {

    const searchResult = fillSearchResult(data);

    const newData = Immutable.fromJS({
      searchResult,
      searchState: 'success',
      searchCity:  0,
      sortable:  false,
      lastSearchFilter: { name },
      searchWithName: true
    });

    return state.merge(newData);
  },
  [ActionTypes.SEARCH_CATEGORY_WITH_NAME_FAIL]: state => {
    return state.set('searchState', 'failed');
  },

  // 显示、隐藏备注
  [ActionTypes.SHOW_COMMENT]: (state, { comment }) => state.set('comment', comment),
  [ActionTypes.HIDE_COMMENT]: state => state.set('comment', ''),

  // 调整排序
  [ActionTypes.SORT_SECOND_CATEGORY]: (state, { newSearchResult }) => {
    return state.set('searchResult', newSearchResult);
  },

  // 即将转移到的分类
  [ActionTypes.SELECTED_TRANSLATE_FIRST_CATEGORY]: (state, { id }) => {
    return state.set('willTranslateFirstCategory', id);
  },
  [ActionTypes.SELECTED_TRANSLATE_SECOND_CATEGORY]: (state, { id }) => {
    return state.set('willTranslateSecondCategory', id);
  },

  // 显示、隐藏上线城市
  [ActionTypes.SHOW_ACTIVE_CITIES]: (state, { id }) => {
    return state.set('showActiveCities', id);
  },
  [ActionTypes.HIDE_ACTIVE_CITIES]: state => {
    return state.set('showActiveCities', 0);
  },

  // 请求删除二级分类
  [ActionTypes.DELETE_SECOND_CATEGORY_NORMAL]: state => {
    const newData = Immutable.fromJS({
      deleteCategoryState: 'normal',
      willTranslateFirstCategory: 0,
      willTranslateSecondCategory: 0
    });

    return state.merge(newData);
  },
  [ActionTypes.DELETE_SECOND_CATEGORY_WAITING]: state => {
    return state.set('deleteCategoryState', 'pending');
  },
  [ActionTypes.DELETE_SECOND_CATEGORY_SUCCESS]: (state, { deletedId }) => {

    let newState = state.set('deleteCategoryState', 'success');

    newState = newState.update(
      'secondCategoriesList',
      list => list.filter(obj => obj.id !== deletedId)
    );

    newState = newState.update(
      'searchResult',
      searchResult => (
        searchResult.map(
          firstCategory => (
            firstCategory.update('list', list => (
              list.filter(
                secondCategory => secondCategory.get('id') !== deletedId
              )
            ))
          )
        )
      )
    );

    return newState;
  }
}

const categoryManage = (state = initialState, action) => action.type in switchType
? switchType[action.type](state, action)
: state;

export default categoryManage;