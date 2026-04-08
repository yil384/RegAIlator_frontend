import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const addAuditLog = (auditLogDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.auditLogs,
        data: auditLogDetails
    }, true);

export const fetchAuditLogs = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.auditLogs,
        params: params
    }, true);

export const fetchAuditLogDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.auditLogById(id)
    }, true);

export const updateAuditLog = (id, auditLogDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.auditLogById(id),
        data: auditLogDetails
    }, true);

export const deleteAuditLog = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.auditLogById(id)
    }, true);

// Backwards-compatible aliases
export {
    addAuditLog as addWatchLog,
    fetchAuditLogs as fetchWatchLogs,
    fetchAuditLogDetails as fetchWatchLogDetails,
    updateAuditLog as updateWatchLog,
    deleteAuditLog as deleteWatchLog
};
