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

export const usersMenu = {
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
                {
                    id: 'users_menu_instructors',
                    title: 'Instructors',
                    type: 'item',
                    url: '/instructors',
                    // url: '/users?role=instructor',
                    icon: icons['SupervisedUserCircle'],
                    breadcrumbs: false
                },
                {
                    id: 'users_menu_students',
                    title: 'Students',
                    type: 'item',
                    url: '/students',
                    // url: '/users?role=student',
                    icon: icons['SupervisorAccount'],
                    breadcrumbs: false
                }
            ]
        }
    ]
};

export const instructorMenu = {
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
                    id: 'users_menu_students',
                    title: 'Students',
                    type: 'item',
                    url: '/students',
                    // url: '/users?role=student',
                    icon: icons['SupervisorAccount'],
                    breadcrumbs: false
                }
            ]
        }
    ]
};
