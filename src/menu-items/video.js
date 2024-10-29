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
                    id: 'files_all',
                    title: 'All Files',
                    type: 'item',
                    url: '/files',
                    icon: icons['IconFiles'],
                    breadcrumbs: false
                }
            ]
        }
    ]
};
