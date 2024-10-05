import { call, put, takeLatest } from 'redux-saga/effects';
import * as actionTypes from './auth.actionTypes';
import * as authActions from './auth.actions';

import { registerUser, loginUser } from './auth.helper';
import { setSession } from '../../../services/authService';

import toast from 'react-hot-toast';

function* handleAuthSuccess(response, history) {
    yield call(setSession, response);
    yield call(history.push, '/dashboard');
}

function* registerUserSaga(action) {
    try {
        const { history, ...userDetails } = action.payload.userDetails;
        const response = yield call(registerUser, userDetails);
        yield put(authActions.registerUserSuccessAction(response));
        yield call(handleAuthSuccess, response, history);
    } catch (e) {
        toast.error(e.message || 'Something went wrong!');
        yield put(authActions.registerUserFailureAction(e));
    }
}

function* loginUserSaga(action) {
    try {
        const { rememberMe, history, ...loginCredentials } = action.payload.loginDetails;
        const response = yield call(loginUser, loginCredentials);
        yield put(authActions.loginUserSuccessAction({ rememberMe, loginCredentials, ...response }));
        yield call(handleAuthSuccess, response, history);
    } catch (e) {
        toast.error(e.message || 'Something went wrong!');
        yield put(authActions.loginUserFailureAction(e));
    }
}

export default function* authSagas() {
    yield takeLatest(actionTypes.REGISTER_USER, registerUserSaga);
    yield takeLatest(actionTypes.LOGIN_USER, loginUserSaga);
}
