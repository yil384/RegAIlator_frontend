// assets
import { IconList, IconListSearch, IconAlertTriangle } from '@tabler/icons';

// constant
const icons = {
    IconList,
    IconListSearch,
    IconAlertTriangle
};

//-----------------------|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||-----------------------//

export const logsMenu = {
    id: 'logs_menu',
    title: 'Praxi Logs',
    type: 'group',
    children: [
        {
            id: 'watch_logs_menu',
            title: 'Watch Logs',
            type: 'item',
            url: '/logs/watch-logs',
            icon: icons['IconListSearch'],
            breadcrumbs: false
        },
        {
            id: 'error_logs_menu',
            title: 'Error Logs',
            type: 'item',
            url: '/logs/error-logs',
            icon: icons['IconAlertTriangle'],
            breadcrumbs: false
        }
    ]
};

export const watchLogsMenu = {
    id: 'logs_menu',
    title: 'Praxi Logs',
    type: 'group',
    children: [
        {
            id: 'watch_logs_menu',
            title: 'Watch Logs',
            type: 'item',
            url: '/logs/watch-logs',
            icon: icons['IconListSearch'],
            breadcrumbs: false
        }
    ]
};

