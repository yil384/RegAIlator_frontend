import { all, fork } from 'redux-saga/effects';
import authSagas from '../views/authentication/session/auth.sagas';
import usersSagas from '../views/users/users.sagas';
import videoGroupsSagas from '../views/video-group/video-groups.sagas';
import videoViewerSagas from '../views/video-viewer/videoRender.sagas';

// single entry point to start all Sagas at once
export default function* rootSaga() {
    yield all([
        fork(authSagas),
        fork(usersSagas),
        fork(videoViewerSagas),
        fork(videoGroupsSagas)
    ]);
}
