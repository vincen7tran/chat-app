import { combineReducers } from 'redux';
import * as actionTypes from '../actions/types';

const initialUserState = {
  currentUser: null,
  isLoading: true
};

const userReducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload,
        isLoading: false
      };
    case actionTypes.CLEAR_USER:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
};

const channelReducer = (state = null, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return action.payload;
    default:
      return state;
  };
};

const rootReducer = combineReducers({
  user: userReducer,
  channel: channelReducer
});

export default rootReducer;