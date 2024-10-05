import React from 'react';
import { connect } from 'react-redux';

// material-ui
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    OutlinedInput
} from '@material-ui/core';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useScriptRef from '../../../../hooks/useScriptRef';
import AnimateButton from '../../../../ui-component/extended/AnimateButton';

import LoaderBackdrop from './../../../../ui-component/LoaderBackdrop';
import { forgotPassword } from '../auth.helper';

import { useStyles } from './loginFrom.style';

const ForgotPasswordForm = ({ loginUserAction, isLoading, setIsEmailSent, ...others }) => {
    const classes = useStyles();

    const scriptedRef = useScriptRef();

    return (
        <React.Fragment>
            <Formik
                initialValues={{
                    // email: 'xriviewer@gmail.com'
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        if (scriptedRef.current) {
                            forgotPassword({
                                email: values.email
                            });
                            setStatus({ success: true });
                            setSubmitting(false);
                            setIsEmailSent(true);
                        }
                    } catch (err) {
                        if (scriptedRef.current) {
                            setStatus({ success: false });
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                            setIsEmailSent(false);
                        }
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth error={Boolean(errors.email)} className={classes.loginInput}>
                            <InputLabel htmlFor='outlined-adornment-email-login'>Email Address</InputLabel>
                            <OutlinedInput
                                id='outlined-adornment-email-login'
                                type='email'
                                value={values.email}
                                name='email'
                                onBlur={handleBlur}
                                onChange={handleChange}
                                label='Email Address'
                                inputProps={{
                                    classes: {
                                        notchedOutline: classes.notchedOutline
                                    }
                                }}
                            />
                            {errors.email && (
                                <FormHelperText error id='standard-weight-helper-text-email-login'>
                                    {' '}
                                    {errors.email}{' '}
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
                                    Submit Request
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

export default connect(mapStateToProps, null)(ForgotPasswordForm);
