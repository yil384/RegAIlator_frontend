import * as actionTypes from './videoRender.actionTypes';

export const initialState = {
    viewerSession: null,
    isPlaying: false,
    error: null
};

const viewerReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.VIEWER_RENDER_START:
            return {
                ...state,
                isPlaying: true
            };
        case actionTypes.VIEWER_RENDER_PAUSE:
            return {
                ...state,
                isPlaying: false
            };
        case actionTypes.VIEWER_RENDER_START_FAILURE:
            return {
                ...state,
                error: action.payload.errorResponse,
                isPlaying: false
            };
        case actionTypes.VIEWER_RENDER_RECORD_SESSION:
            return {
                ...state,
                viewerSession: action.payload.sessionData
            };
        case actionTypes.VIEWER_RENDER_RECORD_SESSION_FAILURE:
            return {
                ...state,
                error: action.payload.errorResponse
            };
        default:
            return state;
    }
};

export default viewerReducer;
