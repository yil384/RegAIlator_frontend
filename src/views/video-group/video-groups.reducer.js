import * as actionTypes from './video-groups.actionTypes';

export const initialState = {
    videoGroups: null,
    videoGroupDetails: null,
    isLoading: false,
    error: null
};

//-----------------------|| AUTH REDUCER ||-----------------------//

const videoGroupsReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_VIDEO_GROUPS:
            return {
                ...state,
                isLoading: true
            };
        case actionTypes.FETCH_VIDEO_GROUPS_SUCCESS:
            return {
                ...state,
                videoGroups: action.payload.videoGroupsResponse,
                isLoading: false
            };
        case actionTypes.FETCH_VIDEO_GROUPS_FAILURE:
            return {
                ...state,
                error: action.payload.errorResponse,
                isLoading: false
            };
        case actionTypes.ADD_VIDEO_GROUPS:
            return {
                ...state,
                isLoading: true
            };
        case actionTypes.ADD_VIDEO_GROUPS_SUCCESS:
            return {
                ...state,
                isLoading: false
            };
        case actionTypes.ADD_VIDEO_GROUPS_FAILURE:
            return {
                ...state,
                error: action.payload.errorResponse,
                isLoading: false
            };
        case actionTypes.FETCH_VIDEO_GROUPS_DETAILS:
            return {
                ...state,
                videoGroupDetails: null,
                isLoading: true
            };
        case actionTypes.FETCH_VIDEO_GROUPS_DETAILS_SUCCESS:
            return {
                ...state,
                videoGroupDetails: action.payload.videoGroupDetailsResponse,
                isLoading: false
            };
        case actionTypes.FETCH_VIDEO_GROUPS_DETAILS_FAILURE:
            return {
                ...state,
                videoGroupDetails: null,
                error: action.payload.errorResponse,
                isLoading: false
            };
        default:
            return state;
    }
};

export default videoGroupsReducer;
