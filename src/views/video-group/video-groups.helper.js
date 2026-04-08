import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const addDocumentGroup = (groupDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.documentGroups,
        data: groupDetails
    }, true);

export const fetchDocumentGroups = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.documentGroups,
        params: params
    }, true);

export const fetchDocumentGroupDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.documentGroupById(id)
    }, true);

export const updateDocumentGroup = (id, groupDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.documentGroupById(id),
        data: groupDetails
    }, true);

export const deleteDocumentGroup = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.documentGroupById(id)
    }, true);

// Backwards-compatible aliases
export {
    addDocumentGroup as addVideoGroup,
    fetchDocumentGroups as fetchVideoGroups,
    fetchDocumentGroupDetails as fetchVideoGroupDetails,
    updateDocumentGroup as updateVideoGroup,
    deleteDocumentGroup as deleteVideoGroup
};
