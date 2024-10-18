// assets
import { IconFolders, IconListSearch, IconFolderPlus, IconFile, IconFilePlus, IconFiles } from '@tabler/icons';
import { SupervisorAccountOutlined, PeopleOutline, BallotOutlined, DocumentScannerOutlined, ChromeReaderModeOutlined } from '@material-ui/icons';

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
            id: 'users_menu',
            title: 'Supplier Survey',
            type: 'collapse',
            icon: BallotOutlined,
            children: [
                {
                    id: 'menu_suppliers',
                    title: 'Suppliers',
                    type: 'item',
                    url: '/suppliers',
                    icon: SupervisorAccountOutlined,
                    breadcrumbs: false
                },
                {
                    id: 'menu_templates',
                    title: 'Survey Templates',
                    type: 'item',
                    url: '/survey-templates',
                    icon: ChromeReaderModeOutlined,
                    breadcrumbs: false
                },
                {
                    id: 'menu_documents',
                    title: 'Supplier Documents',
                    type: 'collapse',
                    icon: DocumentScannerOutlined,
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
        }
    ]
};
