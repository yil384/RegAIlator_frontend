import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const addErrorLog = (errorLogDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.errorLogs,
        data: errorLogDetails
    }, true);

export const fetchErrorLogs = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.errorLogs,
        params: params
    }, true);

export const fetchErrorLogDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.errorLogById(id)
    }, true);

export const updateErrorLog = (id, errorLogDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.errorLogById(id),
        data: errorLogDetails
    }, true);

export const deleteErrorLog = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.errorLogById(id)
    }, true);
