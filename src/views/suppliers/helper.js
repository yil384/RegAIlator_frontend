// suppliers.helper.js

import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const fetchSuppliers = () =>
    fetchApi(
        {
            method: 'GET',
            url: endpoints.suppliers,
        },
        true // 包含身份验证
    );

export const addSupplier = (data) =>
    fetchApi(
        {
            method: 'POST',
            url: endpoints.suppliers,
            data
        },
        true // 包含身份验证
    );
    
export const updateSupplier = (supplierId, data) =>
    fetchApi(
        {
            method: 'PUT', // 通常更新操作使用 PUT 或 PATCH
            url: `${endpoints.suppliers}/${supplierId}`,
            data
        },
        true // 包含身份验证
    );
