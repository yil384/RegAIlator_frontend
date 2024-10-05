import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@material-ui/core';
import { Divider, Grid, Stack, Typography, useMediaQuery } from '@material-ui/core';

// project imports
import AuthWrapper from '../AuthWrapper';
import AuthCardWrapper from '../AuthCardWrapper';
import Logo from '../../../ui-component/Logo';
import AuthFooter from '../../../ui-component/cards/AuthFooter';
import { verifyEmail } from '../session/auth.helper';

import queryString from 'query-string';

const VerifyEmail = ({ location }) => {
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

    const { token } = queryString.parse(location.search);

    useEffect(() => {
        verifyEmail({ token });
    }, [token]);

    return (
        <AuthWrapper>
            <Grid container direction='column' justifyContent='flex-end' sx={{ minHeight: '100vh' }}>
                <Grid item xs={12}>
                    <Grid container justifyContent='center' alignItems='center'
                          sx={{ minHeight: 'calc(100vh - 68px)' }}>
                        <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                            <AuthCardWrapper>
                                <Grid container spacing={2} alignItems='center' justifyContent='center'>
                                    <Grid item sx={{ mb: 3 }}>
                                        <RouterLink to='#'>
                                            <Logo />
                                        </RouterLink>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid
                                            container
                                            direction={matchDownSM ? 'column-reverse' : 'row'}
                                            alignItems='center'
                                            justifyContent='center'
                                        >
                                            <Grid item>
                                                <Stack alignItems='center' justifyContent='center' spacing={1}>
                                                    <Typography
                                                        color={theme.palette.secondary.main}
                                                        gutterBottom
                                                        variant={matchDownSM ? 'h3' : 'h2'}
                                                    >
                                                        Email Verification
                                                    </Typography>
                                                    <Typography variant='caption' fontSize='16px'
                                                                textAlign={matchDownSM ? 'center' : ''}>
                                                        Success!
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid item container direction='column' alignItems='center' xs={12}>
                                            <Typography
                                                component={RouterLink}
                                                to='/dashboard'
                                                variant='subtitle1'
                                                sx={{ textDecoration: 'none' }}
                                            >
                                                Go to Dashboard
                                            </Typography>
                                        </Grid>
                                    </Grid>
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

export default VerifyEmail;
