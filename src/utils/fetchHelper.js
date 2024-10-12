import axios from 'axios';
import config from './../configs';

import { getAccessToken, softLogout } from '../services/authService';

const instance = axios.create({
    baseURL: config[config.env].httpURL,
    responseType: 'json'
});


const fetchApi = async (options) => {
    const token = await getAccessToken();
    if (token) {
        instance.defaults.headers['Authorization'] = `Bearer ${token}`;
    } else {
        instance.defaults.headers['Authorization'] = '';
    }

    // instance.defaults.timeout = 1000;

    const onSuccess = function(response) {
        return response.data;
    };

    const onError = function(error) {
        if (error.message === 'Network Error') {
            return Promise.reject({
                error: error.response || error.message,
                msg: 'Couldn\'t connect server!',
                code: 404
            });
        }

        if (error.response?.data?.code === 401) {
            softLogout();
        }

        if (error.response?.data) {
            return Promise.reject(error.response?.data || {
                code: 404,
                message: 'Something went wrong!',
                error: error.response
            });
        }

        return Promise.reject({
            error: error.response || error.message,
            msg: 'Something went wrong!',
            code: 404
        });
    };

    return instance(options)
        .then(onSuccess)
        .catch(onError);
};

export {
    fetchApi
};
