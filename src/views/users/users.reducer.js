import * as actionTypes from './users.actionTypes';

export const initialState = {
    users: null,
    userDetails: null,
    isLoading: false,
    error: null
};

//-----------------------|| AUTH REDUCER ||-----------------------//

const usersReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_USERS:
            return {
                ...state,
                isLoading: true
            };
        case actionTypes.FETCH_USERS_SUCCESS:
            return {
                ...state,
                users: action.payload.usersResponse,
                isLoading: false
            };
        case actionTypes.FETCH_USERS_FAILURE:
            return {
                ...state,
                error: action.payload.errorResponse,
                isLoading: false
            };
        case actionTypes.FETCH_USER_DETAILS:
            return {
                ...state,
                userDetails: null,
                isLoading: true
            };
        case actionTypes.FETCH_USER_DETAILS_SUCCESS:
            return {
                ...state,
                userDetails: action.payload.userDetailsResponse,
                isLoading: false
            };
        case actionTypes.FETCH_USER_DETAILS_FAILURE:
            return {
                ...state,
                userDetails: null,
                error: action.payload.errorResponse,
                isLoading: false
            };
        default:
            return state;
    }
};

export default usersReducer;
