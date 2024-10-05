// assets
import { IconVideoPlus, IconFolders, IconListSearch, IconVideo, IconFolderPlus } from '@tabler/icons';
import { VideoLibrary } from '@material-ui/icons';

// constant
const icons = {
    IconVideo,
    IconVideoPlus,
    IconFolders,
    VideoLibrary,
    IconListSearch,
    IconFolderPlus
};

//-----------------------|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||-----------------------//

export const videosMenu = {
    id: 'videos_menu',
    title: 'Praxi Manager',
    type: 'group',
    children: [
        {
            id: 'videos_groups_menu',
            title: 'Video Groups',
            icon: icons['IconFolders'],
            type: 'collapse',
            children: [
                {
                    id: 'videos_groups_all',
                    title: 'All Video Groups',
                    type: 'item',
                    url: '/video-groups',
                    icon: icons['IconFolders'],
                    breadcrumbs: false
                },
                {
                    id: 'add_videos_groups',
                    title: 'Add Video Groups',
                    type: 'item',
                    url: '/video-groups/add',
                    icon: icons['IconFolderPlus'],
                    breadcrumbs: false
                }
            ]
        },
        {
            id: 'videos_list_menu',
            title: 'Videos',
            type: 'collapse',
            url: '/videos',
            icon: icons['IconVideo'],
            breadcrumbs: false,
            children: [
                {
                    id: 'videos_all',
                    title: 'All Videos',
                    type: 'item',
                    url: '/videos',
                    icon: icons['VideoLibrary'],
                    breadcrumbs: false
                },
                {
                    id: 'add_videos_all',
                    title: 'Add Videos',
                    type: 'item',
                    url: '/videos/add',
                    icon: icons['IconVideoPlus'],
                    breadcrumbs: false
                }
            ]
        }
    ]
};
