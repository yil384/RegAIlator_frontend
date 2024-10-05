import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

// material-ui
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput
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

import LoaderBackdrop from './../../../../ui-component/LoaderBackdrop';

import { resetPassword } from '../auth.helper';
import toast from 'react-hot-toast';

import { useStyles } from './loginFrom.style';

const ResetPasswordForm = ({ loginUserAction, isLoading, token, ...others }) => {
    const history = useHistory();
    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <React.Fragment>
            <Formik
                initialValues={{}}
                validationSchema={Yup.object().shape({
                    password: Yup.string().max(50).required('Password is required')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        if (scriptedRef.current) {
                            await resetPassword(token, {
                                password: values.password
                            });
                            setStatus({ success: true });
                            setSubmitting(false);
                            history.replace('/session/login');
                            toast.success('Password reset successful, please login with new password!');
                        }
                    } catch (err) {
                        toast.error(err.message || 'Something went wrong!');
                        if (scriptedRef.current) {
                            setStatus({ success: false });
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                        }
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form onSubmit={handleSubmit}>

                        <FormControl fullWidth error={Boolean(errors.password)} className={classes.loginInput}>
                            <InputLabel htmlFor='outlined-adornment-password-login'>New Password</InputLabel>
                            <OutlinedInput
                                id='outlined-adornment-password-login'
                                type={showPassword ? 'text' : 'password'}
                                value={values.password}
                                name='password'
                                onBlur={handleBlur}
                                onChange={handleChange}
                                endAdornment={
                                    <InputAdornment position='end'>
                                        <IconButton
                                            aria-label='toggle password visibility'
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge='end'
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label='Password'
                                inputProps={{
                                    classes: {
                                        notchedOutline: classes.notchedOutline
                                    }
                                }}
                            />
                            {errors.password && (
                                <FormHelperText error id='standard-weight-helper-text-password-login'>
                                    {errors.password}
                                </FormHelperText>
                            )}
                        </FormControl>

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
                                    size='large'
                                    type='submit'
                                    variant='contained'
                                    color='primary'
                                >
                                    Reset Password
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
    isLoading: state.authReducer.isLoading
});

export default connect(mapStateToProps, null)(ResetPasswordForm);
