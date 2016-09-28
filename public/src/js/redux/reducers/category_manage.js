import { Manage as ActionTypes } from 'actions/category_action_types';
import { clone } from 'utils/index';

const initialState = {
  editId: 0,
  basicDataLoadStatus: 'pending',
  saveDataStatus: 'normal',

  name: "",
  comment: "",
  selectedCategory: 0,

  primaryCategories: [],

  showInAllCity: 1,
  isAttachProduct: 0
};

const redoList = [];
const undoList = [];

const addNewCitiesList = (provinces, provinceId, list) => {
  const mapData = [...provinces].map(([key, val]) => {
    let newVal = {
      id: val.id,
      name: val.name
    };

    if ('list' in val)
      newVal.list = new Set([...val.list]);

    if (provinceId === key)
      newVal.list = new Set([...list]);

    return [key, newVal];
  });

  return new Map(mapData);
};

const switchType = {

  // 加载基础数据
  [ActionTypes.LOAD_BASIC_DATA_EDIT]: (state, { status, id, isSecondary, data }) => {
    switch (status) {
      case 'pending':
        return initialState;
      case 'success':

        let {
          categoryData: { category },
          primaryCategories,
          showInAllCity
        } = data;

        return {
          ...state,
          editId: id,
          basicDataLoadStatus: 'success',
          name: category.name || '',
          comment: category.remarks || '',
          showInAllCity: showInAllCity ? 1 : 0,
          isAttachProduct: category.isAddition,
          selectedCategory: category.parent_id,
          primaryCategories,
        };

      case 'failed':
        return {
          ...state,
          basicDataLoadStatus: status
        }
      default:
        console.error('Unknow status value:', status);
        return state
    }
  },

  [ActionTypes.LOAD_BASIC_DATA_ADD]: (state, { status, isSecondary, primaryCategories, err }) => {
    return {
      ...state,
      basicDataLoadStatus: 'success',
      primaryCategories,
      selectedCategory: primaryCategories[0] ? primaryCategories[0].id : 0
    };
  },

  // 加载省份信息
  [ActionTypes.LOAD_PROVINCE_DATA]: (state, { status, err }) => {
    return {
      ...state,
      basicDataLoadStatus: status
    };
  },

  [ActionTypes.CHANGE_PRIMARY_CATEGORY]: (state, { id }) => {
    return {
      ...state,
      selectedCategory: id
    };
  },

  [ActionTypes.SAVE_DATA]: (state, { status }) => {
    return {
      ...state,
      saveDataStatus: status
    };
  },

  [ActionTypes.CHANGE_CATEGORY_NAME]: (state, { name }) => {
    return {
      ...state,
      name
    };
  },

  [ActionTypes.CHANGE_CATEGORY_COMMENT]: (state, { comment }) => {
    return {
      ...state,
      comment
    };
  },

  [ActionTypes.CHECK_SHOW_IN_ALL_CITIES]: state => {
    return {
      ...state,
      showInAllCity: 1
    };
  },

  [ActionTypes.UNCHECK_SHOW_IN_ALL_CITIES]: state => {
    return {
      ...state,
      showInAllCity: 0
    };
  },

  [ActionTypes.CHANGE_ATTACH_PRODUCT]: (state, { checked }) => {
    return {
      ...state,
      isAttachProduct: checked
    };
  }
}

const categoryManage = (state = initialState, action) => action.type in switchType
? switchType[action.type](clone(state), action)
: state;

export default categoryManage;