import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const addInstructor = (instructorDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.instructors,
        data: instructorDetails
    }, true);

export const fetchInstructors = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.instructors,
        params: params
    }, true);

export const fetchInstructorDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.instructorById(id)
    }, true);

export const updateInstructor = (id, instructorDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.instructorById(id),
        data: instructorDetails
    }, true);

export const deleteInstructor = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.instructorById(id)
    }, true);
