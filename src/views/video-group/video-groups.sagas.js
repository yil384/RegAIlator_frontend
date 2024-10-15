import { call, put, takeLatest } from 'redux-saga/effects';
import * as actionTypes from './video-groups.actionTypes';
import * as videoGroupActions from './video-groups.actions';

import { addVideoGroup, fetchVideoGroupDetails, fetchVideoGroups } from './video-groups.helper';

import toast from 'react-hot-toast';

function* fetchVideoGroupsSaga(action) {
    try {
        const { params } = action.payload;
        const response = yield call(fetchVideoGroups, params);
        yield put(videoGroupActions.fetchVideoGroupsSuccessAction(response));
    } catch (e) {
        toast.error(e.message || 'Something went wrong!');
        yield put(videoGroupActions.fetchVideoGroupsFailureAction(e));
    }
}

function* addVideoGroupSaga(action) {
    try {
        const { history, ...groupDetails } = action.payload.groupDetails;
        const response = yield call(addVideoGroup, groupDetails);
        yield put(videoGroupActions.addVideoGroupSuccessAction(response));
        toast.success('Group added successfully!');
        // 刷新数据
        yield put(videoGroupActions.fetchVideoGroupsAction());
    } catch (e) {
        toast.error(e.message || 'Something went wrong!');
        yield put(videoGroupActions.addVideoGroupFailureAction(e));
    }
}

function* fetchVideoGroupDetailsSaga(action) {
    try {
        const { videoGroupId } = action.payload;
        const response = yield call(fetchVideoGroupDetails, videoGroupId);
        yield put(videoGroupActions.fetchVideoGroupDetailsSuccessAction(response));
    } catch (e) {
        toast.error(e.message || 'Something went wrong!');
        yield put(videoGroupActions.fetchVideoGroupDetailsFailureAction(e));
    }
}

export default function* usersSagas() {
    yield takeLatest(actionTypes.ADD_VIDEO_GROUPS, addVideoGroupSaga);
    yield takeLatest(actionTypes.FETCH_VIDEO_GROUPS, fetchVideoGroupsSaga);
    yield takeLatest(actionTypes.FETCH_VIDEO_GROUPS_DETAILS, fetchVideoGroupDetailsSaga);
}
