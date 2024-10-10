// assets
import { IconUsers, IconUserExclamation } from '@tabler/icons';
import { SupervisorAccount, SupervisedUserCircle, PeopleOutline } from '@material-ui/icons';

// constant
const icons = {
    IconUsers: IconUsers,
    PeopleOutline: PeopleOutline,
    IconUserExclamation: IconUserExclamation,
    SupervisorAccount: SupervisorAccount,
    SupervisedUserCircle: SupervisedUserCircle
};

export const adminMenu = {
    id: 'users_menu',
    title: 'Accounts',
    caption: 'Praxi Users',
    type: 'group',
    children: [
        {
            id: 'users_menu',
            title: 'Explorer Users',
            type: 'collapse',
            icon: icons['IconUsers'],
            children: [
                {
                    id: 'users_menu_all',
                    title: 'All Users',
                    type: 'item',
                    url: '/users',
                    icon: icons['PeopleOutline'],
                    breadcrumbs: false
                },
            ]
        }
    ]
};

export const usersMenu = {
    id: 'users_menu',
    title: 'Accounts',
    caption: 'Praxi Users',
    type: 'group',
    children: [
        {
            id: 'users_menu',
            title: 'People',
            type: 'collapse',
            icon: icons['IconUsers'],
            children: [
                {
                    id: 'menu_suppliers',
                    title: 'Suppliers',
                    type: 'item',
                    url: '/students',
                    icon: icons['SupervisorAccount'],
                    breadcrumbs: false
                },
                {
                    id: 'menu_contacts',
                    title: 'Contacts',
                    type: 'item',
                    url: '/instructors',
                    icon: icons['SupervisedUserCircle'],
                    breadcrumbs: false
                }
            ]
        }
    ]
};
