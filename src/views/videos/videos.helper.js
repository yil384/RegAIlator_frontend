import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const addDocument = (documentDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.documents,
        data: documentDetails
    }, true);

export const fetchDocuments = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.documents,
        params: params
    }, true);


export const fetchDocumentDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.documentsById(id)
    }, true);

export const updateDocument = (id, documentDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.documentsById(id),
        data: documentDetails
    }, true);

export const deleteDocument = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.documentsById(id)
    }, true);

export const parseDocuments = (ids) =>
    fetchApi({
        method: 'POST',
        url: `${endpoints.documents}/parse`,
        data: ids
    }, true);

// Backwards-compatible aliases
export {
    addDocument as addVideo,
    fetchDocuments as fetchVideos,
    fetchDocumentDetails as fetchVideoDetails,
    updateDocument as updateVideo,
    deleteDocument as deleteVideo,
    parseDocuments as parseVideos
};
