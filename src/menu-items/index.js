import { dashboard } from './dashboard';
import { videoViewer } from './videoViewer';
import { usersMenu, instructorMenu, adminMenu } from './users';
import { filesMenu as filesMenu } from './video';
import { logsMenu, watchLogsMenu } from './logs';
// import { other } from './other';
// import { pages } from './pages';
// import { utilities } from './utilities';

//-----------------------|| MENU ITEMS ||-----------------------//

const adminMenuItems = {
    items: [
        dashboard,
        adminMenu,
        filesMenu,
        videoViewer,
        logsMenu
    ]
};

const defaultMenuItems = {
    items: [
        dashboard,
        usersMenu,
        filesMenu,
    ]
};

export {
    adminMenuItems,
    defaultMenuItems
};
