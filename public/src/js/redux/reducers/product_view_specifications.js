import { ActionTypes } from 'actions/product_view_specifications';
import Util from 'utils/index';

const initialState = {
    basicDataLoadStatus: 'pending',
    failedMsg: '',
};

const switchType = {
    [ActionTypes.LOAD_BASIC_DATA]: (state, { status, reason }) => {
        switch(status) {
            case 'success':
                state.basicDataLoadStatus = 'success';
                break;

            case 'failed':
                state.basicDataLoadStatus = 'failed';
                state.failedMsg = reason;
                break;

            default: // 'pendding'
                state.basicDataLoadStatus = 'pending';
                break;
        }

        return state;
    }
}

const productSKUViewSpecifications = (state = initialState, action) => {
    return action.type in switchType
    ? switchType[action.type](Util.clone(state), action)
    : state;
}

export default productSKUViewSpecifications;