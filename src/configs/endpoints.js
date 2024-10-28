import { mentionUsers } from "../views/authentication/session/auth.helper";

const endpoints = {
    register: `/auth/register`,
    registerInstructors: `/auth/register-instructors`,
    login: `/auth/login`,
    verifyEmail: `/auth/verify-email`,
    forgotPassword: `/auth/forgot-password`,
    resetPassword: `/auth/reset-password`,
    mentionUsers: `/auth/send-mention-email`,
    users: `/users`,
    userById: (id) => `/users/${id}`,
    suppliers: '/auth/my-suppliers',
    suppliersBatch: '/auth/my-suppliers-batch',
    surveys: `/auth/my-surveys`,
    surveyTemplateById: (id) => `/survey-templates/${id}`,
    videoGroups: `/video-groups`,
    videoGroupById: (id) => `/video-groups/${id}`,
    videos: `/videos`,
    videosById: (id) => `/videos/${id}`,
    watchLogs: `/watch-logs`,
    watchLogById: (id) => `/watch-logs/${id}`,
    errorLogs: `/error-logs`,
    errorLogById: (id) => `/error-logs/${id}`,
    upload_file: `videos/upload_file`,
    billOfMaterials: '/auth/my-bill-of-materials',
};

export default endpoints;
