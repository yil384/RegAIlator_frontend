import { dashboard } from './dashboard';
import { videoViewer } from './videoViewer';
import { usersMenu, instructorMenu, adminMenu, productsMenu } from './users';
import { filesMenu as filesMenu } from './video';
import { logsMenu, watchLogsMenu } from './logs';
// import { other } from './other';
// import { pages } from './pages';
// import { utilities } from './utilities';

//-----------------------|| MENU ITEMS ||-----------------------//

const adminMenuItems = {
    items: [
        adminMenu,
        dashboard,
        filesMenu,
        productsMenu,
        usersMenu,
        logsMenu,
    ]
};

const defaultMenuItems = {
    items: [
        dashboard,
        filesMenu,
        productsMenu,
        usersMenu,
        logsMenu
    ]
};

export {
    adminMenuItems,
    defaultMenuItems
};
