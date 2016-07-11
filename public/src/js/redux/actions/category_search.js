import { debounce } from 'utils/optimization';
import Req from 'utils/request';
import Url from 'config/url';

import { Search as SearchActionTypes, Manage as ManageActionTypes } from 'actions/category_action_types';
import { ActionTypes as SelectorActionTypes } from './cities_selector';

import manageActions from 'actions/category_manage';

const es6promisify = function(func) {
  return function(...args) {
    let ctx = this;
    return new Promise((resolve, reject) => {
      func.apply(ctx, args).done(resolve).fail(reject);
    });
  };
};

const get = es6promisify(Req.get);
const put = es6promisify(Req.put);
const del = es6promisify(Req.del);

const deleteSecondaryCategory = (
  deleteSecondCategoryID,
  newSecondaryCategoryID
) => del(Url.deleteSecondaryCategory.toString(deleteSecondCategoryID), {
  new_category: newSecondaryCategoryID
});

// 伪fetch请求
const fakeFetch = returnData => new Promise((resolve, reject) => {
  setTimeout(() => {
    // Math.trunc(Math.random() * 10) > 2 ? resolve(returnData) : reject()
    Math.trunc(Math.random() * 10) > 2 ? resolve(returnData) : resolve(returnData)
  }, 700);
});

const loadBasicData = () => (
  dispatch => {
    dispatch({
      type: SearchActionTypes.LOAD_BASIC_DATA,
      status: 'pending'
    });

    const loadCategories = get(Url.categories.toString());
    const loadProvinces  = get(Url.provinces.toString());

    Promise.all(
      [ loadCategories, loadProvinces ]
    ).then(
      ([ categoriesData, provincesData] ) => {
        dispatch({
          type: SearchActionTypes.LOAD_BASIC_DATA,
          status: 'success',
          categoriesData,
          provincesData
        });
      }
    ).catch(
      err => {
        console.error(err);
        dispatch({
          type: SearchActionTypes.LOAD_BASIC_DATA,
          status: 'failed'
        });
      }
    )
  }
);

const selectedFirstCategory = firstCategoryId => ({
  type: SearchActionTypes.SELECTED_DATA_FIRST_CATEGORY,
  id: firstCategoryId
});

const selectedSecondCategory = secondCategoryId => ({
  type: SearchActionTypes.SELECTED_DATA_SECOND_CATEGORY,
  id: secondCategoryId
});

const selectedProvince = provinceId => (
  dispatch => {
    dispatch({
      type: SearchActionTypes.SELECTED_DATA_PROVINCE,
      provinceId
    });

    const loadCitiesData = id => get(Url.cities.toString(id));

    loadCitiesData(provinceId).then(
      data => {
        dispatch({
          type: SearchActionTypes.LOADED_CITIES_DATA,
          status: 'success',
          citiesData: data
        });
      }
    ).catch(
      err => {
        console.error(err);
      }
    );
  }
);

const selectedCity = cityId => ({
  type: SearchActionTypes.SELECTED_DATA_CITY,
  cityId
});

const searchCategoriesWithName = name => (
  dispatch => {
    dispatch({
      type: SearchActionTypes.SEARCH_CATEGORY_WITH_NAME_WAITING
    });

    const searchRequest = name => get(Url.searchCategoriesWithName.toString(), { name });

    return searchRequest(name).then(
      data => dispatch({
        type: SearchActionTypes.SEARCH_CATEGORY_WITH_NAME_SUCCESS,
        data,
        name
      })
    ).catch(
      err => {
        dispatch({
          type: SearchActionTypes.SEARCH_CATEGORY_WITH_NAME_FAIL,
          msg: err
        });
      }
    )
  }
)

const searchCategories = (useLastSearchFilter = false) => (
  (dispatch, getState) => {
    dispatch({
      type: SearchActionTypes.SEARCH_CATEGORY_WAITING
    });

    const state = getState().categorySearch.toJS();

    const {
      selectedCity,
      selectedFirstCategory,
      selectedProvince,
      selectedSecondCategory
    } = useLastSearchFilter ? state.lastSearchFilter : state;

    const params = {};

    if (selectedCity !== 0)
      params.city_id = selectedCity;
    else if (selectedProvince !== 0)
      params.province_id = selectedProvince;

    if (selectedSecondCategory !== 0)
      params.secondary_id = selectedSecondCategory;
    else if (selectedFirstCategory !== 0)
      params.primary_id = selectedFirstCategory;

    const searchRequest = get(Url.searchCategories.toString(), params);

    return searchRequest.then(
      data => dispatch({
        type: SearchActionTypes.SEARCH_CATEGORY_SUCCESS,
        data,
        sortable: state.selectedCity !== 0
      })
    ).catch(() => {
      dispatch({
        type: SearchActionTypes.SEARCH_CATEGORY_FAIL
      });
    });
  }
);

const postNewSort = debounce((cityId, sort) => {

  const ranking = sort.map(
    obj => ({
      category_id: obj.id,
      sort: obj.index
    })
  );

  return put(Url.sortCategories.toString(), {
    ranking,
    regionalism_id: cityId
  });

}, 900);

const sortCategories = (primaryCategoryId, moveId, moveIndex, nextId, nextIndex) => (
  (dispatch, getState) => {

    const { categorySearch } = getState();
    let searchResult = categorySearch.get('searchResult');
    let newSort = [];

    let nextCategory, moveCategory, nextCategoryListIndex, moveCategoryListIndex;

    searchResult = searchResult.map(
      primaryCategory => {

        const pid = primaryCategory.get('id');

        if (primaryCategoryId === pid) {
          primaryCategory.get('list').forEach((secondaryCategory, i) => {

            const sid = secondaryCategory.get('id');

            if (sid === moveId) {
              secondaryCategory = secondaryCategory.merge({ index: nextIndex });
              moveCategory = secondaryCategory;
              moveCategoryListIndex = i;
            } else if (sid === nextId) {
              secondaryCategory = secondaryCategory.merge({ index: moveIndex });
              nextCategory = secondaryCategory;
              nextCategoryListIndex = i;
            }

            newSort.push({
              id: sid,
              index: secondaryCategory.get('index')
            });
          });

          return primaryCategory.update('list', list => (
            list.set(moveCategoryListIndex, nextCategory).set(nextCategoryListIndex, moveCategory)
          ));

        } else
          return primaryCategory;
      }
    );

    postNewSort(categorySearch.get('searchCity'), newSort);

    return dispatch({
      type: SearchActionTypes.SORT_SECOND_CATEGORY,
      newSearchResult: searchResult
    });
  }
);

const showComment = id => (
  dispatch => {
    get(Url.getCategoryComment.toString(id)).then(data => {
      dispatch({
        type: SearchActionTypes.SHOW_COMMENT,
        comment: data.remarks || '（没有备注）'
      });
    }).catch(err => {
      console.error(err);
    });
  }
);

const hideComment = () => ({
  type: SearchActionTypes.HIDE_COMMENT
});

const readyToDeleteCategory = id => ({
  type: SearchActionTypes.READY_TO_DELETE_CATEGORY,
  id
})

const resetDeleteCategory = () => ({
  type: SearchActionTypes.DELETE_SECOND_CATEGORY_NORMAL
});

const selectedTranslateFirstCategory = id => ({
  type: SearchActionTypes.SELECTED_TRANSLATE_FIRST_CATEGORY,
  id
});

const selectedTranslateSecondCategory = id => ({
  type: SearchActionTypes.SELECTED_TRANSLATE_SECOND_CATEGORY,
  id
});

const showActiveCities = (id, isSecondary = false) => (
  (dispatch, getState) => {

    const manageLoadBasicDataAction = manageActions.loadBasicData(
      isSecondary ? 'secondary' : 'primary',
      true,
      id
    );

    const dispatchDelegate = args => {
      dispatch(args);

      if (args.type === ManageActionTypes.LOAD_BASIC_DATA_EDIT && (args.status === 'success')) {
        dispatch({
          type: SearchActionTypes.SHOW_ACTIVE_CITIES,
          id
        });
      }
    };

    manageLoadBasicDataAction(dispatchDelegate);
  }
);

const hideActiveCities = () => ({
  type: SearchActionTypes.HIDE_ACTIVE_CITIES
})

const saveData = () => (
  (dispatch, getState) => {
    const manageState = getState().categoryManage;

    const manageSaveAction = manageActions.saveData(manageState.primaryCategories.length === 0 ? 'primary' : 'secondary');

    const dispatchDelegate = args => {
      dispatch(args);

      if (args.type === ManageActionTypes.SAVE_DATA && (args.status === 'success')) {
        dispatch({
          type: SearchActionTypes.HIDE_ACTIVE_CITIES,
          id: 0
        });
      }
    };

    manageSaveAction(dispatchDelegate, getState);
  }
);

const deleteSecondCategory = id => (
  (dispatch, getState) => {
    dispatch({
      type: SearchActionTypes.DELETE_SECOND_CATEGORY_WAITING
    });

    return deleteSecondaryCategory(
      id, 
      getState().categorySearch.toJS().willTranslateSecondCategory
    ).then(
      data => dispatch({
        type: SearchActionTypes.DELETE_SECOND_CATEGORY_SUCCESS,
        deletedId: Number(id)
      })
    ).catch(
      err => {
        alert(err);
        dispatch({
          type: SearchActionTypes.DELETE_SECOND_CATEGORY_NORMAL,
          msg: err
        });
      }
    )
  }
);

export default {
  SearchActionTypes,

  loadBasicData,

  selectedFirstCategory,
  selectedSecondCategory,
  selectedCity,
  selectedProvince,

  searchCategories,
  searchCategoriesWithName,

  sortCategories,

  showComment,
  hideComment,

  showActiveCities,
  hideActiveCities,
  saveData,

  readyToDeleteCategory,
  selectedTranslateFirstCategory,
  selectedTranslateSecondCategory,
  deleteSecondCategory,
  resetDeleteCategory,
}