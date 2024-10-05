import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const addWatchLog = (watchLogDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.watchLogs,
        data: watchLogDetails
    }, true);

export const fetchWatchLogs = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.watchLogs,
        params: params
    }, true);

export const fetchWatchLogDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.watchLogById(id)
    }, true);

export const updateWatchLog = (id, watchLogDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.watchLogById(id),
        data: watchLogDetails
    }, true);

export const deleteWatchLog = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.watchLogById(id)
    }, true);
