import { call, put, takeLatest, select } from 'redux-saga/effects';
import * as actionTypes from './videoRender.actionTypes';
import { addWatchLog } from '../watch-logs/watch-logs.helper';
import { viewerRenderRecordSessionFailureAction } from './videoRender.actions';

const getViewerSession = (state) => state.viewerReducer.viewerSession;

function* recordViewerLog() {
    try {
        const viewerSession = yield select(getViewerSession);
        if (viewerSession?.info?.progress > 1 && viewerSession?.recordings?.length > 20) {
            yield call(addWatchLog, {
                videoGroupId: viewerSession?.info?.videoGroupId,
                recordings: viewerSession
            });
        }
    } catch (e) {
        yield put(viewerRenderRecordSessionFailureAction(e));
    }
}

export default function* usersSagas() {
    yield takeLatest(actionTypes.VIEWER_RENDER_PAUSE, recordViewerLog);
}
