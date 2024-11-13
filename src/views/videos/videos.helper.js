import { fetchApi } from '../../utils/fetchHelper';
import endpoints from './../../configs/endpoints';

export const addVideo = (videoDetails) =>
    fetchApi({
        method: 'POST',
        url: endpoints.videos,
        data: videoDetails
    }, true);

export const fetchVideos = (params) =>
    fetchApi({
        method: 'GET',
        url: endpoints.videos,
        params: params
    }, true);


export const fetchVideoDetails = (id) =>
    fetchApi({
        method: 'GET',
        url: endpoints.videosById(id)
    }, true);

export const updateVideo = (id, videoDetails) =>
    fetchApi({
        method: 'PATCH',
        url: endpoints.videosById(id),
        data: videoDetails
    }, true);

export const deleteVideo = (id) =>
    fetchApi({
        method: 'DELETE',
        url: endpoints.videosById(id)
    }, true);

export const parseVideos = (ids) =>
    fetchApi({
        method: 'POST',
        url: `${endpoints.videos}/parse`,
        data: ids
    }, true);
