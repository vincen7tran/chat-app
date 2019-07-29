import * as actionTypes from './types';

// User Actions
export const setUser = user => {
  return {
    type: actionTypes.SET_USER,
    payload: user
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER
  };
};

// Channel Actions
export const setCurrentChannel = channel => {
  console.log('action' , channel);
  return {
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: channel
  };
};

export const setPrivateChannel = isPrivateChannel => {
  return {
    type: actionTypes.SET_PRIVATE_CHANNEL,
    payload: isPrivateChannel
  };
};
