import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const addStudents = (instructorDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.students,
        data: instructorDetails
    }, true);

export const fetchStudents = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.students,
        params: params
    }, true);

export const fetchStudentDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.studentById(id)
    }, true);

export const updateStudent = (id, instructorDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.studentById(id),
        data: instructorDetails
    }, true);

export const deleteStudent = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.studentById(id)
    }, true);
