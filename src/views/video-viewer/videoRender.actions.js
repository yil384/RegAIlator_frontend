import * as actionTypes from './videoRender.actionTypes';

export const viewerRenderStartAction = (params) => ({
    payload: { params },
    type: actionTypes.VIEWER_RENDER_START
});

export const viewerRenderPauseAction = (params) => ({
    payload: { params },
    type: actionTypes.VIEWER_RENDER_PAUSE
});

export const viewerRenderStartFailureAction = (errorResponse) => ({
    payload: { errorResponse },
    type: actionTypes.VIEWER_RENDER_START_FAILURE
});

export const viewerRenderRecordSessionAction = (sessionData) => ({
    payload: { sessionData },
    type: actionTypes.VIEWER_RENDER_RECORD_SESSION
});

export const viewerRenderRecordSessionFailureAction = (errorResponse) => ({
    payload: { errorResponse },
    type: actionTypes.VIEWER_RENDER_RECORD_SESSION_FAILURE
});
