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

export const updateSurvey = (surveyId, data) =>
    fetchApi(
        {
            method: 'PUT',
            url: `${endpoints.surveys}/${surveyId}`,
            data
        },
        true // 包含身份验证
    );

export const deleteSurveys = (surveyIds) =>
    fetchApi(
        {
            method: 'DELETE',
            url: `${endpoints.surveys}`,
            data: { surveyIds }
        },
        true // 包含身份验证
    );