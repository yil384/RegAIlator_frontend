import * as actionTypes from './users.actionTypes';

export const fetchUsersAction = (params) => ({
    payload: { params },
    type: actionTypes.FETCH_USERS
});

export const fetchUsersSuccessAction = (usersResponse) => ({
    payload: { usersResponse },
    type: actionTypes.FETCH_USERS_SUCCESS
});

export const fetchUsersFailureAction = (errorResponse) => ({
    payload: { errorResponse },
    type: actionTypes.FETCH_USERS_FAILURE
});

export const fetchUserDetailsAction = (userId) => ({
    payload: { userId },
    type: actionTypes.FETCH_USER_DETAILS
});

export const fetchUserDetailsSuccessAction = (userDetailsResponse) => ({
    payload: { userDetailsResponse },
    type: actionTypes.FETCH_USER_DETAILS_SUCCESS
});

export const fetchUserDetailsFailureAction = (errorResponse) => ({
    payload: { errorResponse },
    type: actionTypes.FETCH_USER_DETAILS_FAILURE
});
