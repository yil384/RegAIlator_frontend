import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

// Create a new survey
export const addSurvey = (surveyData) =>
  fetchApi({
    method: 'POST',
    url: endpoints.surveys,
    data: surveyData,
  });

// Update an existing survey
export const updateSurvey = (surveyId, surveyData) =>
  fetchApi({
    method: 'PATCH',
    url: `${endpoints.surveys}/${surveyId}`,
    data: surveyData,
  });

// Delete a survey
export const deleteSurvey = (surveyId) =>
  fetchApi({
    method: 'DELETE',
    url: `${endpoints.surveys}/${surveyId}`,
  });

// Get survey by ID
export const getSurveyById = (surveyId) =>
  fetchApi({
    method: 'GET',
    url: `${endpoints.surveys}/${surveyId}`,
  });
