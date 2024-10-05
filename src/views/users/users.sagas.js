import { call, put, takeLatest } from 'redux-saga/effects';
import * as actionTypes from './users.actionTypes';
import * as usersActions from './users.actions';

import { fetchUserDetails, fetchUsers } from './users.helper';

import toast from 'react-hot-toast';

function* fetchUsersSaga(action) {
    try {
        const { params } = action.payload;
        const response = yield call(fetchUsers, params);
        yield put(usersActions.fetchUsersSuccessAction(response));
    } catch (e) {
        toast.error(e.message || 'Something went wrong!');
        yield put(usersActions.fetchUsersFailureAction(e));
    }
}

function* fetchUserDetailsSaga(action) {
    try {
        const { userId } = action.payload;
        const response = yield call(fetchUserDetails, userId);
        yield put(usersActions.fetchUserDetailsSuccessAction(response));
    } catch (e) {
        toast.error(e.message || 'Something went wrong!');
        yield put(usersActions.fetchUserDetailsFailureAction(e));
    }
}

export default function* usersSagas() {
    yield takeLatest(actionTypes.FETCH_USERS, fetchUsersSaga);
    yield takeLatest(actionTypes.FETCH_USER_DETAILS, fetchUserDetailsSaga);
}
