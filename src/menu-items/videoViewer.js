// assets
import { IconBrandChrome, IconHelp, IconSitemap, IconVideo, IconMovie } from '@tabler/icons';

// constant
const icons = {
    IconBrandChrome: IconBrandChrome,
    IconHelp: IconHelp,
    IconSitemap: IconSitemap,
    IconVideo: IconVideo,
    IconMovie
};

//-----------------------|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||-----------------------//

export const videoViewer = {
    id: 'video_viewer_menu',
    title: 'Praxi Viewer',
    type: 'group',
    children: [
        {
            id: 'video_viewer_menu',
            title: 'Video Viewer',
            type: 'item',
            url: '/video-explorer/viewer',
            icon: icons['IconMovie'],
            breadcrumbs: false
        }
    ]
};
