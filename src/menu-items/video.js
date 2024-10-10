// assets
import { IconFolders, IconListSearch, IconFolderPlus, IconFile, IconFilePlus, IconFiles } from '@tabler/icons';

// constant
const icons = {
    IconFile,
    IconFilePlus,
    IconFiles,

    IconFolders,
    IconListSearch,
    IconFolderPlus
};

//-----------------------|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||-----------------------//

export const filesMenu = {
    id: 'videos_menu',
    title: 'Praxi Manager',
    caption: 'Praxi Manager',
    type: 'group',
    children: [
        {
            id: 'file_groups_menu',
            title: 'File Groups',
            icon: icons['IconFolders'],
            type: 'collapse',
            children: [
                {
                    id: 'file_groups_all',
                    title: 'All File Groups',
                    type: 'item',
                    url: '/video-groups',
                    icon: icons['IconFolders'],
                    breadcrumbs: false
                },
                {
                    id: 'add_file_groups',
                    title: 'Add File Groups',
                    type: 'item',
                    url: '/video-groups/add',
                    icon: icons['IconFolderPlus'],
                    breadcrumbs: false
                }
            ]
        },
        {
            id: 'files_list_menu',
            title: 'Files',
            type: 'collapse',
            url: '/videos',
            icon: icons['IconFile'],
            breadcrumbs: false,
            children: [
                {
                    id: 'files_all',
                    title: 'All Files',
                    type: 'item',
                    url: '/videos',
                    icon: icons['IconFiles'],
                    breadcrumbs: false
                },
                {
                    id: 'add_files_all',
                    title: 'Add Files',
                    type: 'item',
                    url: '/videos/add',
                    icon: icons['IconFilePlus'],
                    breadcrumbs: false
                }
            ]
        }
    ]
};
