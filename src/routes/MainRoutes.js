import React, { lazy } from 'react';
import { Route, Switch, useLocation, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
// project imports
import MainLayout from './../layout/MainLayout';
import Loadable from '../ui-component/Loadable';

import { getAccessToken } from '../services/authService';

import toast from 'react-hot-toast';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('../views/dashboard')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('../views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('../views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('../views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('../views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('../views/utilities/TablerIcons')));

const VideoViewer = Loadable(lazy(() => import('../views/video-viewer')));

const UsersComponent = Loadable(lazy(() => import('../views/users')));
const UserDetailsComponent = Loadable(lazy(() => import('../views/users/userDetails')));
const InstructorsComponent = Loadable(lazy(() => import('../views/instructors')));
const InstructorDetailsComponent = Loadable(lazy(() => import('../views/instructors/details')));
const StudentsComponent = Loadable(lazy(() => import('../views/students')));
const StudentDetailsComponent = Loadable(lazy(() => import('../views/students/details')));
const VideoGroupsComponent = Loadable(lazy(() => import('../views/video-group')));
const AddVideoGroupsComponent = Loadable(lazy(() => import('../views/video-group/addVideoGroup')));
const VideoGroupDetailsComponent = Loadable(lazy(() => import('../views/video-group/videoGroupDetails')));
const VideosComponent = Loadable(lazy(() => import('../views/videos')));
const VideosDetailsComponent = Loadable(lazy(() => import('../views/videos/videoDetails')));
const AddVideoComponent = Loadable(lazy(() => import('../views/videos/addVideo')));
const WatchLogsComponent = Loadable(lazy(() => import('../views/watch-logs')));
const ErrorLogsComponent = Loadable(lazy(() => import('../views/error-logs')));

const SamplePage = Loadable(lazy(() => import('../views/sample-page')));

//-----------------------|| MAIN ROUTING ||-----------------------//

const routePaths = {
    dashboard: '/dashboard',
    users: '/users',
    userById: '/users/:id',
    instructors: '/instructors',
    instructorById: '/instructors/:id',
    students: '/students',
    studentById: '/students/:id',
    videoViewer: '/video-explorer/viewer',
    videoGroupById: '/video-groups/:id',
    videoGroups: '/video-groups',
    addVideoGroups: '/video-groups/add',
    videos: '/videos',
    videosById: '/videos/:id',
    addVideo: '/videos/add',
    watchLogs: '/logs/watch-logs',
    errorLogs: '/logs/error-logs'
};

const MainRoutes = () => {
    const location = useLocation();

    const PrivateRoute = ({ component: Component, ...rest }) =>
        (
            <Route {...rest} render={props => {
                const isAccessTokenValid = getAccessToken();
                if (!isAccessTokenValid) {
                    toast.error('Your session has expired, please sing in again!');
                }

                return (
                    isAccessTokenValid ? <Component {...props} /> : <Redirect to={{ pathname: '/session/login' }} />
                );
            }} />
        );

    return (
        <Route
            path={[
                routePaths.dashboard,
                routePaths.userById,
                routePaths.users,
                routePaths.instructorById,
                routePaths.instructors,
                routePaths.studentById,
                routePaths.students,
                routePaths.videoViewer,
                routePaths.videoGroupById,
                routePaths.addVideoGroups,
                routePaths.videoGroups,
                routePaths.addVideo,
                routePaths.videos,
                routePaths.videosById,
                routePaths.watchLogs,
                routePaths.errorLogs,

                '/utils/util-typography',
                '/utils/util-color',
                '/utils/util-shadow',
                '/icons/tabler-icons',
                '/icons/material-icons',

                '/sample-page'
            ]}>
            <MainLayout>
                <Switch location={location} key={location.pathname}>
                    <PrivateRoute path={routePaths.dashboard} component={DashboardDefault} />

                    <PrivateRoute path={routePaths.userById} component={UserDetailsComponent} />
                    <PrivateRoute path={routePaths.users} component={UsersComponent} />

                    <PrivateRoute path={routePaths.instructorById} component={InstructorDetailsComponent} />
                    <PrivateRoute path={routePaths.instructors} component={InstructorsComponent} />

                    <PrivateRoute path={routePaths.studentById} component={StudentDetailsComponent} />
                    <PrivateRoute path={routePaths.students} component={StudentsComponent} />

                    <PrivateRoute path={routePaths.addVideoGroups} component={AddVideoGroupsComponent} />
                    <PrivateRoute path={routePaths.videoGroupById} component={VideoGroupDetailsComponent} />
                    <PrivateRoute path={routePaths.videoGroups} component={VideoGroupsComponent} />
                    <PrivateRoute path={routePaths.addVideo} component={AddVideoComponent} />
                    <PrivateRoute path={routePaths.videosById} component={VideosDetailsComponent} />
                    <PrivateRoute path={routePaths.videos} component={VideosComponent} />

                    <PrivateRoute path={routePaths.videoViewer} component={VideoViewer} />

                    <PrivateRoute path={routePaths.watchLogs} component={WatchLogsComponent} />
                    <PrivateRoute path={routePaths.errorLogs} component={ErrorLogsComponent} />

                    <PrivateRoute path='/utils/util-typography' component={UtilsTypography} />
                    <PrivateRoute path='/utils/util-color' component={UtilsColor} />
                    <PrivateRoute path='/utils/util-shadow' component={UtilsShadow} />
                    <PrivateRoute path='/icons/tabler-icons' component={UtilsTablerIcons} />
                    <PrivateRoute path='/icons/material-icons' component={UtilsMaterialIcons} />

                    <Route path='/sample-page' component={SamplePage} />
                </Switch>
            </MainLayout>
        </Route>
    );
};

const mapStateToProps = (state) => ({
    authReducer: state.authReducer
});


export default connect(mapStateToProps, null)(MainRoutes);

