// suppliers.helper.js

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
        true // 包含身份验证
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
        true // 包含身份验证
    );

export const batchAddSuppliers = (data) =>
    fetchApi(
        {
            method: 'POST',
            url: endpoints.suppliersBatch,
            data
        },
        true // 包含身份验证
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
        true // 包含身份验证
    );

export const deleteSuppliers = (supplierIds) =>
    fetchApi(
        {
            method: 'DELETE',
            url: `${endpoints.suppliers}`,
            data: { supplierIds }
        },
        true // 包含身份验证
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
                    url: endpoints.mentionUsers,  // 假设在 endpoints 中定义了此端点
                    data: { email: data.email, subject: data.subject, content: data.content }
                },
                true // 包含身份验证
            )
        )
    );
};
