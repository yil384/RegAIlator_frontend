import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import Loadable from '../ui-component/Loadable';

// project imports
import MinimalLayout from './../layout/MinimalLayout';

const AuthLogin = Loadable(lazy(() => import('../views/authentication/session/Login')));
const AuthRegister = Loadable(lazy(() => import('../views/authentication/session/Register')));
const VerifyEmail = Loadable(lazy(() => import('../views/authentication/verify-email')));
const ForgotPassword = Loadable(lazy(() => import('../views/authentication/forgot-password')));
const ResetPassword = Loadable(lazy(() => import('../views/authentication/reset-password')));

//-----------------------|| AUTHENTICATION ROUTING ||-----------------------//

const AuthenticationRoutes = () => {
    const location = useLocation();

    return (
        <Route path={['/session/login', '/session/register', '/verify-email', '/forgot-password', '/reset-password']}>
            <MinimalLayout>
                <Switch location={location} key={location.pathname}>
                    <Route path='/session/login' component={AuthLogin} />
                    <Route path='/session/register' component={AuthRegister} />
                    <Route path='/verify-email' component={VerifyEmail} />
                    <Route path='/forgot-password' component={ForgotPassword} />
                    <Route path='/reset-password' component={ResetPassword} />
                </Switch>
            </MinimalLayout>
        </Route>
    );
};

export default AuthenticationRoutes;
