// helper.js

import { fetchApi } from '../../utils/fetchHelper';
import endpoints from '../../configs/endpoints';

// Fetch all Bill of Materials
export const fetchBillOfMaterials = () =>
    fetchApi(
        {
            method: 'GET',
            url: endpoints.billOfMaterials,
        },
        true
    );

// Add a single material
export const addMaterial = (materialData) =>
    fetchApi(
        {
            method: 'POST',
            url: endpoints.billOfMaterials,
            data: materialData,
        },
        true
    );

// Batch add materials (from Excel upload)
export const batchAddMaterials = (materialsArray) =>
    fetchApi(
        {
            method: 'POST',
            url: endpoints.billOfMaterialsBatchAdd,
            data: materialsArray,
        },
        true
    );
