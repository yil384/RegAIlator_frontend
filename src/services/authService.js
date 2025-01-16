import localStorageService from './localStorageService';
import cookieService from './cookieService';
import { CONSTANTS } from '../configs/constants';
import toast from 'react-hot-toast';

export const setSession = ({ user, tokens }) => {
    localStorageService.setItem(CONSTANTS.session_user, user);
    toast.success(`Welcome ${user.firstname}!`);
    localStorageService.setItem(CONSTANTS.session_tokens, tokens);
    cookieService.setCookie(CONSTANTS.access_token, tokens.access.token);
};

export const clearSession = () => {
    // localStorageService.removeItem(CONSTANTS.session_user);
    localStorageService.removeItem(CONSTANTS.session_tokens);
    cookieService.deleteCookie(CONSTANTS.access_token);
};

export const softLogout = () => {
    localStorageService.removeItem(CONSTANTS.session_tokens);
    cookieService.deleteCookie(CONSTANTS.access_token);
};

export const getAccessToken = () => {
    return cookieService.getCookie(CONSTANTS.access_token);
};

export const getLocalUser = () => {
    return localStorageService.getItem(CONSTANTS.session_user);
};
