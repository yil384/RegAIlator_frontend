import { call, put, takeLatest } from 'redux-saga/effects';
import * as actionTypes from './auth.actionTypes';
import * as authActions from './auth.actions';

import { registerUser, loginUser } from './auth.helper';
import { setSession } from '../../../services/authService';

import toast from 'react-hot-toast';

export const getSanitizedResponse = (userResponse) => {
    const sanitizedResponse = { ...userResponse, user: { ...userResponse.user } };
    delete sanitizedResponse.user.suppliers;
    delete sanitizedResponse.user.surveys;
    return sanitizedResponse;
};

function* handleAuthSuccess(response, history) {
    yield call(setSession, getSanitizedResponse(response));
    yield call(history.push, '/dashboard');
}

function* registerUserSaga(action) {
    try {
        const { history, ...userDetails } = action.payload.userDetails;
        const response = yield call(registerUser, userDetails);
        yield put(authActions.registerUserSuccessAction(getSanitizedResponse(response)));
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
        yield put(authActions.loginUserSuccessAction({ rememberMe, loginCredentials, ...getSanitizedResponse(response) }));
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
