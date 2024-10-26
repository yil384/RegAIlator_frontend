import React, { lazy } from 'react';
import { Route, Switch, useLocation, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
// project imports
import MainLayout from './../layout/MainLayout';
import Loadable from '../ui-component/Loadable';

import { getAccessToken } from '../services/authService';

import toast from 'react-hot-toast';
import BillOfMaterials from '../views/billOfMatetrial';

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
const SuppliersComponent = Loadable(lazy(() => import('../views/suppliers')));
// const SupplierDetailsComponent = Loadable(lazy(() => import('../views/suppliers/supplierDetails')));
const SurveyTemplatesComponent = Loadable(lazy(() => import('../views/survey-templates')));
// const SurveyTemplateDetailsComponent = Loadable(lazy(() => import('../views/survey-templates/details')));
const VideoGroupsComponent = Loadable(lazy(() => import('../views/video-group')));
const VideoGroupDetailsComponent = Loadable(lazy(() => import('../views/video-group/videoGroupDetails')));
const VideosComponent = Loadable(lazy(() => import('../views/videos')));
const AddVideoComponent = Loadable(lazy(() => import('../views/videos/addVideo')));
const WatchLogsComponent = Loadable(lazy(() => import('../views/watch-logs')));
const ErrorLogsComponent = Loadable(lazy(() => import('../views/error-logs')));
const BillOfMaterialsComponent = Loadable(lazy(() => import('../views/billOfMatetrial')));
const RMAssessmentComponent = Loadable(lazy(() => import('../views/RMAssessment')));
const StatementTemplateComponent = Loadable(lazy(() => import('../views/StatementTemplate')));

//-----------------------|| MAIN ROUTING ||-----------------------//

const routePaths = {
    dashboard: '/dashboard',
    users: '/users',
    userById: '/users/:id',
    suppliers: '/suppliers',
    supplierById: '/suppliers/:id',
    surveyTemplates: '/survey-templates',
    surveyTemplateById: '/survey-templates/:id',
    videoViewer: '/video-explorer/viewer',
    videoGroupById: '/filr-groups/:id',
    videoGroups: '/file-groups',
    videos: '/files',
    videosById: '/files/:id',
    addVideo: '/files/add',
    watchLogs: '/logs/watch-logs',
    errorLogs: '/logs/error-logs',
    BillOfMaterials: '/bill-of-materials',
    RMAssessment: '/rm-assessment',
    Statementtemplate: '/statement-template',
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
                routePaths.supplierById,
                routePaths.suppliers,
                routePaths.surveyTemplateById,
                routePaths.surveyTemplates,
                routePaths.videoViewer,
                routePaths.videoGroupById,
                routePaths.videoGroups,
                routePaths.addVideo,
                routePaths.videos,
                routePaths.videosById,
                routePaths.watchLogs,
                routePaths.errorLogs,
                routePaths.BillOfMaterials,
                routePaths.RMAssessment,
                routePaths.Statementtemplate,

                '/utils/util-typography',
                '/utils/util-color',
                '/utils/util-shadow',
                '/icons/tabler-icons',
                '/icons/material-icons',

            ]}>
            <MainLayout>
                <Switch location={location} key={location.pathname}>
                    <PrivateRoute path={routePaths.dashboard} component={DashboardDefault} />

                    <PrivateRoute path={routePaths.userById} component={UserDetailsComponent} />
                    <PrivateRoute path={routePaths.users} component={UsersComponent} />

                    <PrivateRoute path={routePaths.suppliers} component={SuppliersComponent} />
                    {/* <PrivateRoute path={routePaths.supplierById} component={SupplierDetailsComponent} /> */}

                    {/* <PrivateRoute path={routePaths.surveyTemplateById} component={SurveyTemplateDetailsComponent} /> */}
                    <PrivateRoute path={routePaths.surveyTemplates} component={SurveyTemplatesComponent} />

                    <PrivateRoute path={routePaths.videoGroupById} component={VideoGroupDetailsComponent} />
                    <PrivateRoute path={routePaths.videoGroups} component={VideoGroupsComponent} />
                    <PrivateRoute path={routePaths.addVideo} component={AddVideoComponent} />
                    <PrivateRoute path={routePaths.videos} component={VideosComponent} />

                    <PrivateRoute path={routePaths.videoViewer} component={VideoViewer} />

                    <PrivateRoute path={routePaths.watchLogs} component={WatchLogsComponent} />
                    <PrivateRoute path={routePaths.errorLogs} component={ErrorLogsComponent} />

                    <PrivateRoute path={routePaths.BillOfMaterials} component={BillOfMaterialsComponent} />
                    <PrivateRoute path={routePaths.RMAssessment} component={RMAssessmentComponent} />
                    <PrivateRoute path={routePaths.Statementtemplate} component={StatementTemplateComponent} />

                    <PrivateRoute path='/utils/util-typography' component={UtilsTypography} />
                    <PrivateRoute path='/utils/util-color' component={UtilsColor} />
                    <PrivateRoute path='/utils/util-shadow' component={UtilsShadow} />
                    <PrivateRoute path='/icons/tabler-icons' component={UtilsTablerIcons} />
                    <PrivateRoute path='/icons/material-icons' component={UtilsMaterialIcons} />
                </Switch>
            </MainLayout>
        </Route>
    );
};

const mapStateToProps = (state) => ({
    authReducer: state.authReducer
});


export default connect(mapStateToProps, null)(MainRoutes);

