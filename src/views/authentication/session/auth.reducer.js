import * as actionTypes from './auth.actionTypes';

export const initialState = {
    user: null,
    tokens: null,
    isLoggedIn: false,
    rememberMe: false,
    loginCredentials: null,
    isLoading: false
};

//-----------------------|| AUTH REDUCER ||-----------------------//

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.REGISTER_USER:
            return {
                ...state,
                isLoading: true
            };
        case actionTypes.REGISTER_USER_SUCCESS:
            return {
                ...state,
                ...action.payload,
                isLoggedIn: true,
                isLoading: false
            };
        case actionTypes.REGISTER_USER_FAILURE:
            return {
                ...state,
                isLoading: false
            };
        case actionTypes.LOGIN_USER:
            return {
                ...state,
                isLoading: true
            };
        case actionTypes.LOGIN_USER_SUCCESS:
            return {
                ...state,
                ...action.payload,
                isLoggedIn: true,
                isLoading: false
            };
        case actionTypes.LOGIN_USER_FAILURE:
            return {
                ...state,
                isLoggedIn: false,
                isLoading: false
            };
        default:
            return state;
    }
};

export default authReducer;
