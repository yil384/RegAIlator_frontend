import * as actionTypes from './auth.actionTypes';

export const registerUserAction = (userDetails) => ({
  payload: { userDetails },
  type: actionTypes.REGISTER_USER
});

export const registerUserSuccessAction = (registerResponse) => ({
  payload: { ...registerResponse },
  type: actionTypes.REGISTER_USER_SUCCESS
});

export const registerUserFailureAction = (errorResponse) => ({
  payload: { errorResponse },
  type: actionTypes.REGISTER_USER_FAILURE
});

export const loginUserAction = (loginDetails) => ({
  payload: { loginDetails },
  type: actionTypes.LOGIN_USER
});

export const loginUserSuccessAction = (userResponse) => ({
  payload: { ...userResponse },
  type: actionTypes.LOGIN_USER_SUCCESS
});

export const loginUserFailureAction = (errorResponse) => ({
  payload: { errorResponse },
  type: actionTypes.LOGIN_USER_FAILURE
});
