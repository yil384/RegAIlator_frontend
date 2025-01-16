import React from 'react';
import { useSelector, connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

// material-ui
import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    Typography
} from '@material-ui/core';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useScriptRef from '../../../../hooks/useScriptRef';
import AnimateButton from '../../../../ui-component/extended/AnimateButton';

// assets
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

//actions
import { loginUserAction } from '../auth.actions';
import { getGreetingTime } from '../../../utilities/Greetings';
import LoaderBackdrop from './../../../../ui-component/LoaderBackdrop';

import { useStyles } from './loginFrom.style';
//============================|| LOGIN ||============================//

const LoginForm = ({ loginUserAction, isLoading, rememberMe, loginCredentials }) => {
    const history = useHistory();
    const classes = useStyles();

    let credentials = {};
    const customization = useSelector((state) => state.customization);
    const scriptedRef = useScriptRef();
    const [rememberMeChecked, setRememberMeChecked] = React.useState(false);

    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    if (rememberMe) {
        credentials = loginCredentials;
    }

    return (
        <React.Fragment>
            <Grid container direction="column" justifyContent="center" spacing={2}>
                <Grid item xs={12}>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex'
                        }}
                    >
                        <Divider className={classes.signDivider} orientation="horizontal" />
                        <AnimateButton>
                            <Button
                                variant="outlined"
                                className={classes.signText}
                                sx={{ borderRadius: customization.borderRadius + 'px' }}
                                disableRipple
                                disabled
                            >
                                {getGreetingTime()}!
                            </Button>
                        </AnimateButton>
                        <Divider className={classes.signDivider} orientation="horizontal" />
                    </Box>
                </Grid>
            </Grid>

            <Formik
                initialValues={{
                    ...credentials
                    // email: 'test@test.com',
                    // password: 'mypassword1234',
                    // email: 'xriviewer@gmail.com',
                    // password: 'mypassword@123'
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                    password: Yup.string().max(255).required('Password is required')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        if (scriptedRef.current) {
                            loginUserAction({ rememberMe: rememberMeChecked, history, ...values });
                            setStatus({ success: true });
                            setSubmitting(false);
                            // history.replace('/dashboard');
                        }
                    } catch (err) {
                        if (scriptedRef.current) {
                            setStatus({ success: false });
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                        }
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit}>
                        <FormControl fullWidth error={Boolean(errors.email)} className={classes.loginInput}>
                            <InputLabel htmlFor="outlined-adornment-email-login">Email Address</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-email-login"
                                type="email"
                                value={values.email}
                                name="email"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                label="Email Address"
                                inputProps={{
                                    classes: {
                                        notchedOutline: classes.notchedOutline
                                    }
                                }}
                            />
                            {errors.email && (
                                <FormHelperText error id="standard-weight-helper-text-email-login">
                                    {' '}
                                    {errors.email}{' '}
                                </FormHelperText>
                            )}
                        </FormControl>

                        <FormControl fullWidth error={Boolean(errors.password)} className={classes.loginInput}>
                            <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password-login"
                                type={showPassword ? 'text' : 'password'}
                                value={values.password}
                                name="password"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                                inputProps={{
                                    classes: {
                                        notchedOutline: classes.notchedOutline
                                    }
                                }}
                            />
                            {errors.password && (
                                <FormHelperText error id="standard-weight-helper-text-password-login">
                                    {' '}
                                    {errors.password}{' '}
                                </FormHelperText>
                            )}
                        </FormControl>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMeChecked}
                                        onChange={(event) => setRememberMeChecked(event.target.checked)}
                                        name="checked"
                                        color="primary"
                                    />
                                }
                                label="Remember me"
                            />
                            <Typography
                                variant="subtitle1"
                                component={Link}
                                to={'/forgot-password'}
                                color="secondary"
                                sx={{ textDecoration: 'none' }}
                            >
                                Forgot Password?
                            </Typography>
                        </Stack>
                        {errors.submit && (
                            <Box
                                sx={{
                                    mt: 3
                                }}
                            >
                                <FormHelperText error>{errors.submit}</FormHelperText>
                            </Box>
                        )}

                        <Box
                            sx={{
                                mt: 2
                            }}
                        >
                            <AnimateButton>
                                <Button
                                    disableElevation
                                    disabled={isSubmitting}
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    Sign in
                                </Button>
                            </AnimateButton>
                        </Box>
                    </form>
                )}
            </Formik>
            <LoaderBackdrop isLoading={isLoading} />
        </React.Fragment>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading,
    rememberMe: state.authReducer.rememberMe,
    loginCredentials: state.authReducer.loginCredentials
});

const mapDispatchToProps = (dispatch) => ({
    loginUserAction: (loginObj) => dispatch(loginUserAction(loginObj))
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
