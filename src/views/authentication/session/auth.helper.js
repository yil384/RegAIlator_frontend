import { fetchApi } from '../../../utils/fetchHelper';
import endpoints from './../../../configs/endpoints';

export const registerUser = (userDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.register,
        data: userDetails
    });

export const getRegisterInstructor = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.registerInstructors,
        params: params
    });

export const loginUser = (loginDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.login,
        data: loginDetails
    });

export const verifyEmail = (params) =>
    fetchApi({
        method: 'POST',
        url: endpoints.verifyEmail,
        params
    });

export const forgotPassword = (emailDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.forgotPassword,
        data: emailDetails
    });

export const resetPassword = (token, newPasswordDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.resetPassword,
        params: { token },
        data: newPasswordDetails
    });
