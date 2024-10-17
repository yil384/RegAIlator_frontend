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
            id: 'files_list_menu',
            title: 'Files',
            type: 'collapse',
            url: '/files',
            icon: icons['IconFile'],
            breadcrumbs: false,
            children: [
                {
                    id: 'file_groups_menu',
                    title: 'File Groups',
                    type: 'item',
                    url: '/file-groups',
                    icon: icons['IconFolders'],
                    breadcrumbs: false
                },
                {
                    id: 'files_all',
                    title: 'All Files',
                    type: 'item',
                    url: '/files',
                    icon: icons['IconFiles'],
                    breadcrumbs: false
                },
                {
                    id: 'add_files_all',
                    title: 'Add Files',
                    type: 'item',
                    url: '/files/add',
                    icon: icons['IconFilePlus'],
                    breadcrumbs: false
                }
            ]
        }
    ]
};
