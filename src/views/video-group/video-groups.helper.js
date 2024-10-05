import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const addVideoGroup = (groupDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.videoGroups,
        data: groupDetails
    }, true);

export const fetchVideoGroups = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.videoGroups,
        params: params
    }, true);

export const fetchVideoGroupDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.videoGroupById(id)
    }, true);

export const updateVideoGroup = (id, groupDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.videoGroupById(id),
        data: groupDetails
    }, true);

export const deleteVideoGroup = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.videoGroupById(id)
    }, true);
