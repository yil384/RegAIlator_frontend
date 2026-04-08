// surveys.helper.js

import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const fetchSurveys = () =>
    fetchApi(
        {
            method: 'GET',
            url: endpoints.surveys,
        },
        true // Include authentication
    );

export const addSurvey = (data) =>
    fetchApi(
        {
            method: 'POST',
            url: endpoints.surveys,
            data
        },
        true // Include authentication
    );

export const updateSurvey = (surveyId, data) =>
    fetchApi(
        {
            method: 'PUT',
            url: `${endpoints.surveys}/${surveyId}`,
            data
        },
        true // Include authentication
    );

export const addSurveyAttachment = (surveyId, data) =>
    fetchApi(
        {
            method: 'POST',
            url: `${endpoints.surveys}/${surveyId}/attachments`,
            data
        },
        true // Include authentication
    );

export const deleteSurveys = (surveyIds) =>
    fetchApi(
        {
            method: 'DELETE',
            url: `${endpoints.surveys}`,
            data: { surveyIds }
        },
        true // Include authentication
    );