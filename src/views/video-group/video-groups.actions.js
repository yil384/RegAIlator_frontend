import * as actionTypes from './video-groups.actionTypes';

export const fetchVideoGroupsAction = (params) => ({
    payload: { params },
    type: actionTypes.FETCH_VIDEO_GROUPS
});

export const fetchVideoGroupsSuccessAction = (videoGroupsResponse) => ({
    payload: { videoGroupsResponse },
    type: actionTypes.FETCH_VIDEO_GROUPS_SUCCESS
});

export const fetchVideoGroupsFailureAction = (errorResponse) => ({
    payload: { errorResponse },
    type: actionTypes.FETCH_VIDEO_GROUPS_FAILURE
});

export const addVideoGroupAction = (groupDetails) => ({
    payload: { groupDetails },
    type: actionTypes.ADD_VIDEO_GROUPS
});

export const addVideoGroupSuccessAction = () => ({
    type: actionTypes.ADD_VIDEO_GROUPS_SUCCESS
});

export const addVideoGroupFailureAction = (errorResponse) => ({
    payload: { errorResponse },
    type: actionTypes.ADD_VIDEO_GROUPS_FAILURE
});

export const fetchVideoGroupDetailsAction = (videoGroupId) => ({
    payload: { videoGroupId },
    type: actionTypes.FETCH_VIDEO_GROUPS_DETAILS
});

export const fetchVideoGroupDetailsSuccessAction = (videoGroupDetailsResponse) => ({
    payload: { videoGroupDetailsResponse },
    type: actionTypes.FETCH_VIDEO_GROUPS_DETAILS_SUCCESS
});

export const fetchVideoGroupDetailsFailureAction = (errorResponse) => ({
    payload: { errorResponse },
    type: actionTypes.FETCH_VIDEO_GROUPS_DETAILS_FAILURE
});
