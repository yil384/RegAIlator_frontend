import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const fetchUsers = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.users,
        params: params
    }, true);

export const fetchUserDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.userById(id)
    }, true);

export const updateUser = (id, userDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.userById(id),
        data: userDetails
    }, true);

export const deleteUser = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.userById(id)
    }, true);
