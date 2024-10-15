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
