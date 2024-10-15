// surveys.helper.js

import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const fetchSurveys = () =>
    fetchApi(
        {
            method: 'GET',
            url: endpoints.surveys,
        },
        true // 包含身份验证
    );

export const addSurvey = (data) =>
    fetchApi(
        {
            method: 'POST',
            url: endpoints.surveys,
            data
        },
        true // 包含身份验证
    );
