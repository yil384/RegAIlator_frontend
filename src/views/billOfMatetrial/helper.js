// helper.js

import { fetchApi } from '../../utils/fetchHelper';
import endpoints from '../../configs/endpoints';

export const fetchBillOfMaterials = () =>
    fetchApi(
        {
            method: 'GET',
            url: endpoints.billOfMaterials,
        },
        true
    );
