import { mentionUsers } from "../views/authentication/session/auth.helper";

const endpoints = {
    register: `/auth/register`,
    registerInstructors: `/auth/register-instructors`,
    login: `/auth/login`,
    verifyEmail: `/auth/verify-email`,
    forgotPassword: `/auth/forgot-password`,
    resetPassword: `/auth/reset-password`,
    mentionUsers: `/auth/send-mention-email`,
    replyEmail: `/auth/send-reply-email`,
    users: `/users`,
    userById: (id) => `/users/${id}`,
    suppliers: '/auth/my-suppliers',
    suppliersBatch: '/auth/my-suppliers-batch',
    surveys: `/auth/my-surveys`,
    surveyTemplateById: (id) => `/survey-templates/${id}`,
    documentGroups: `/document-groups`,
    documentGroupById: (id) => `/document-groups/${id}`,
    documents: `/documents`,
    documentsById: (id) => `/documents/${id}`,
    auditLogs: `/audit-logs`,
    auditLogById: (id) => `/audit-logs/${id}`,
    errorLogs: `/error-logs`,
    errorLogById: (id) => `/error-logs/${id}`,
    upload_file: `documents/upload_file`,
    // Backwards-compatible aliases for components not yet updated
    videoGroups: `/document-groups`,
    videoGroupById: (id) => `/document-groups/${id}`,
    videos: `/documents`,
    videosById: (id) => `/documents/${id}`,
    watchLogs: `/audit-logs`,
    watchLogById: (id) => `/audit-logs/${id}`,
    billOfMaterials: '/auth/my-bill-of-materials',
    billOfMaterialsBatchAdd: '/auth/my-bill-of-materials-batch-add'
};

export default endpoints;
