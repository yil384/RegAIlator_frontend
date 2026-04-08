// suppliers.helper.js

import suppliers from '.';
import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

/**
 * Fetch all suppliers
 */
export const fetchSuppliers = () =>
    fetchApi(
        {
            method: 'GET',
            url: endpoints.suppliers,
        },
        true // Include authentication
    );

/**
 * Add a new supplier
 */
export const addSupplier = (data) =>
    fetchApi(
        {
            method: 'POST',
            url: endpoints.suppliers,
            data
        },
        true // Include authentication
    );

export const batchAddSuppliers = (data) =>
    fetchApi(
        {
            method: 'POST',
            url: endpoints.suppliersBatch,
            data
        },
        true // Include authentication
    );
/**
 * Update an existing supplier
 */
export const updateSupplier = (supplierId, data) =>
    fetchApi(
        {
            method: 'PUT',
            url: `${endpoints.suppliers}/${supplierId}`,
            data
        },
        true // Include authentication
    );
export const updateSuppliers = (supplierIds, data) =>
    fetchApi(
        {
            method: 'PUT',
            url: `${endpoints.suppliers}`,
            data: { supplierIds, supplierBody: data }
        },
        true // Include authentication
    );

export const deleteSuppliers = (supplierIds) =>
    fetchApi(
        {
            method: 'DELETE',
            url: `${endpoints.suppliers}`,
            data: { supplierIds }
        },
        true // Include authentication
    );

/**
 * Send emails to selected suppliers
 */
export const sendEmailsToSuppliers = (emailData) => {
    return Promise.allSettled(
        emailData.map((data) =>
            fetchApi(
                {
                    method: 'POST',
                    url: endpoints.mentionUsers,  // Assuming this endpoint is defined in endpoints
                    data
                },
                true // Include authentication
            )
        )
    );
};

export const sendReplyEmail = (emailData) => {
    return fetchApi(
        {
            method: 'POST',
            url: endpoints.replyEmail,
            data: emailData
        },
        true // Include authentication
    );
}