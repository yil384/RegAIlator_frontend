import { dashboard } from './dashboard';
import { videoViewer } from './videoViewer';
import { usersMenu, instructorMenu } from './users';
import { videosMenu } from './video';
import { logsMenu, watchLogsMenu } from './logs';
// import { other } from './other';
// import { pages } from './pages';
// import { utilities } from './utilities';

//-----------------------|| MENU ITEMS ||-----------------------//

const adminMenuItems = {
    items: [
        dashboard,
        usersMenu,
        videosMenu,
        videoViewer,
        logsMenu
        // utilities,
        // pages,
        // other,
    ]
};

const studentMenuItems = {
    items: [
        dashboard,
        videoViewer,
        watchLogsMenu
    ]
};

const instructorMenuItems = {
    items: [
        dashboard,
        instructorMenu,
        videosMenu,
        videoViewer,
        watchLogsMenu
    ]
};

const defaultMenuItems = {
    items: [
        dashboard
    ]
};

export {
    adminMenuItems,
    instructorMenuItems,
    studentMenuItems,
    defaultMenuItems
};
