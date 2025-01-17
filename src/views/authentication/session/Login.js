import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@material-ui/core';
import { Divider, Grid, Stack, Typography, useMediaQuery } from '@material-ui/core';

// project imports
import AuthWrapper from '../AuthWrapper';
import AuthCardWrapper from '../AuthCardWrapper';
import LoginForm from '../session/auth-forms/LoginForm';
import Logo from './../../../ui-component/Logo';
import AuthFooter from './../../../ui-component/cards/AuthFooter';

// assets

//================================|| AUTH3 - LOGIN ||================================//

const Login = () => {
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <AuthWrapper>
            <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
                        <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                            <AuthCardWrapper>
                                <Grid container spacing={2} alignItems="center" justifyContent="center">
                                    <Grid item sx={{ mb: 3 }}>
                                        <RouterLink to="#">
                                            <Logo />
                                        </RouterLink>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid
                                            container
                                            direction={matchDownSM ? 'column-reverse' : 'row'}
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Grid item>
                                                <Stack alignItems="center" justifyContent="center" spacing={1}>
                                                    <Typography
                                                        color={theme.palette.secondary.main}
                                                        gutterBottom
                                                        variant={matchDownSM ? 'h3' : 'h2'}
                                                    >
                                                        Hi, Welcome Back
                                                    </Typography>
                                                    <Typography variant="caption" fontSize="16px" textAlign={matchDownSM ? 'center' : ''}>
                                                        Enter your credentials to continue
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <LoginForm login={3} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid item container direction="column" alignItems="center" xs={12}>
                                            <Typography
                                                component={RouterLink}
                                                to="/session/register"
                                                variant="subtitle1"
                                                sx={{ textDecoration: 'none' }}
                                            >
                                                Don't have an account?
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    {/* New message about cookies */}
                                    <Typography variant="body4" color="textSecondary" align="left" sx={{ marginTop: 2 }}>
                                        This website stores cookies on your computer. These cookies are used to collect information about
                                        how you interact with our website and allow us to remember you. We use this information in order to
                                        improve and customize your browsing experience and for analytics and metrics about our visitors both
                                        on this website and other media. To find out more about the cookies we use, see our{' '}
                                        <RouterLink
                                            href="https://www.example.com/privacy-policy"
                                            target="_blank"
                                            style={{ textDecoration: 'underline', color: 'blue' }}
                                        >
                                            Privacy Policy
                                        </RouterLink>
                                        .
                                        <br />
                                        If you decline, your information won't be tracked when you visit this website. A single cookie will
                                        be used in your browser to remember your preference not to be tracked.
                                    </Typography>
                                </Grid>
                            </AuthCardWrapper>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
                    <AuthFooter />
                </Grid>
            </Grid>
        </AuthWrapper>
    );
};

export default Login;
