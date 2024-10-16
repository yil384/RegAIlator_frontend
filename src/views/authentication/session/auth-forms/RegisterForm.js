import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

// material-ui
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Typography,
    useMediaQuery,
    Select,
    MenuItem
} from '@material-ui/core';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useScriptRef from '../../../../hooks/useScriptRef';
import AnimateButton from './../../../../ui-component/extended/AnimateButton';
import { strengthColor, strengthIndicator } from '../../../../utils/password-strength';

// assets
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import { registerUserAction } from '../auth.actions';
import LoaderBackdrop from './../../../../ui-component/LoaderBackdrop';
import OnSubmitValidationError from './../../../../utils/onSubmitValidator';

import { useStyles } from './registerForm.style';
import toast from 'react-hot-toast';
import { getRegisterInstructor } from '../auth.helper';


//===========================||  REGISTER ||===========================//

const RegisterForm = ({ registerUserAction, isLoading, ...others }) => {
    const history = useHistory();
    const classes = useStyles();
    const scriptedRef = useScriptRef();
    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const [showPassword, setShowPassword] = React.useState(false);
    const [agreementChecked, setAgreementChecked] = React.useState(false);
    const [selectedRole, setSelectedRole] = React.useState('');
    const [availableInstructors, setAvailableInstructors] = React.useState(null);
    const [selectedInstructor, setSelectedInstructor] = React.useState('');

    const [strength, setStrength] = React.useState(0);
    const [level, setLevel] = React.useState('');

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const changePassword = (value) => {
        const temp = strengthIndicator(value);
        setStrength(temp);
        setLevel(strengthColor(temp));
    };

    const handleRoleChange = (value) => {
        setSelectedRole(value);
    };

    const handleInstructorChange = (value) => {
        setSelectedInstructor(value);
    };

    const loadInstructors = React.useCallback(async () => {
        const response = await getRegisterInstructor();
        setAvailableInstructors(response?.results);
    });

    React.useEffect(() => {
        setSelectedRole('student');
        loadInstructors();
    }, []);

    const onSubmitValidationError = (formik) => {
        if (!formik.isValid) {
            // toast.error(errors[Object.keys(errors)[0]]);
            toast.error('Please enter all the required credentials to continue.');
        }
    };

    return (
        <React.Fragment>
            <Grid container direction='column' justifyContent='center' spacing={2}>
                <Grid item xs={12} container alignItems='center' justifyContent='center'>
                    <Box
                        sx={{
                            mb: 2
                        }}
                    >
                        <Typography variant='subtitle1'>Sign up with Email address</Typography>
                    </Box>
                </Grid>
            </Grid>

            <Formik
                initialValues={{
                    // firstname: 'test',
                    // lastname: 'test',
                    // email: 'test@test.com',
                    // password: 'test',
                    role: 'user'
                }}
                validationSchema={Yup.object().shape({
                    firstname: Yup.string().min(1).max(30).required('First name is required'),
                    lastname: Yup.string().min(1).max(30).required('Last name is required'),
                    email: Yup.string().email('Must be a valid email').max(50).required('Email is required'),
                    password: Yup.string().min(1).max(30).required('Password is required'),
                    role: Yup.string().required('Role is required'),
                    instructor: Yup.string().optional('Please select your instructor.')
                })}

                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        if (scriptedRef.current) {
                            registerUserAction({ history, ...values });
                            setStatus({ success: true });
                            setSubmitting(false);
                        }
                    } catch (err) {
                        console.error(err);
                        if (scriptedRef.current) {
                            setStatus({ success: false });
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                        }
                    }
                }}
            >
                {(formik) => {
                    const {
                        errors,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        isSubmitting,
                        values,
                        submitCount
                    } = formik;
                    return (
                        <form onSubmit={handleSubmit} {...others} autoComplete='off'>
                            <OnSubmitValidationError callback={onSubmitValidationError} />
                            <Grid container spacing={matchDownSM ? 0 : 2}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth error={Boolean(!!submitCount && errors.firstname)}
                                                 className={classes.loginInput}>
                                        <InputLabel htmlFor='outlined-adornment-fname-register'>First Name</InputLabel>
                                        <OutlinedInput
                                            id='outlined-adornment-fname-register'
                                            type='text'
                                            value={values.firstname}
                                            name='firstname'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                }
                                            }}
                                        />
                                        {!!submitCount && errors.firstname && (
                                            <FormHelperText error id='standard-weight-helper-fname-password-register'>
                                                {errors.firstname}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth error={Boolean(!!submitCount && errors.lastname)}
                                                 className={classes.loginInput}>
                                        <InputLabel htmlFor='outlined-adornment-lname-register'>Last Name</InputLabel>
                                        <OutlinedInput
                                            id='outlined-adornment-lname-register'
                                            type='text'
                                            value={values.lastname}
                                            name='lastname'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                },
                                                form: {
                                                    autocomplete: 'off'
                                                }
                                            }}
                                        />
                                        {!!submitCount && errors.lastname && (
                                            <FormHelperText error id='standard-weight-helper-text--register'>
                                                {errors.lastname}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <FormControl fullWidth error={Boolean(!!submitCount && errors.email)}
                                         className={classes.loginInput} autoComplete='off'>
                                <InputLabel htmlFor='outlined-adornment-email-register'>Email Address</InputLabel>
                                <OutlinedInput
                                    id='outlined-adornment-email-register'
                                    type='email'
                                    autoComplete='off'
                                    value={values.email}
                                    name='email'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    inputProps={{
                                        classes: {
                                            notchedOutline: classes.notchedOutline
                                        },
                                        form: {
                                            autocomplete: 'off'
                                        }
                                    }}
                                />
                                {!!submitCount && errors.email && (
                                    <FormHelperText error id='standard-weight-helper-text--register'>
                                        {' '}
                                        {errors.email}{' '}
                                    </FormHelperText>
                                )}
                            </FormControl>

                            <FormControl fullWidth error={Boolean(!!submitCount && errors.password)}
                                         className={classes.loginInput}>
                                <InputLabel htmlFor='outlined-adornment-password-register'>Password</InputLabel>
                                <OutlinedInput
                                    id='outlined-adornment-password-register'
                                    type={showPassword ? 'text' : 'password'}
                                    value={values.password}
                                    name='password'
                                    label='Password'
                                    onBlur={handleBlur}
                                    onChange={(e) => {
                                        handleChange(e);
                                        changePassword(e.target.value);
                                    }}
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
                                    inputProps={{
                                        classes: {
                                            notchedOutline: classes.notchedOutline
                                        },
                                        autocomplete: 'new-password',
                                        form: {
                                            autocomplete: 'off'
                                        }
                                    }}
                                />
                                {!!submitCount && errors.password && (
                                    <FormHelperText error id='standard-weight-helper-text-password-register'>
                                        {' '}
                                        {errors.password}{' '}
                                    </FormHelperText>
                                )}
                            </FormControl>

                            {strength !== 0 && (
                                <FormControl fullWidth>
                                    <Box sx={{ mb: 2 }}>
                                        <Grid container spacing={2} alignItems='center'>
                                            <Grid item>
                                                <Box
                                                    backgroundColor={level.color}
                                                    sx={{
                                                        width: 100,
                                                        height: 8,
                                                        marginLeft: 2,
                                                        borderRadius: '7px'
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Typography variant='subtitle1' fontSize='0.75rem'>
                                                    {level.label}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </FormControl>
                            )}

                            {/*<FormControl fullWidth error={Boolean(!!submitCount && errors.role)}*/}
                            {/*             className={classes.selectInput}>*/}
                            {/*    <InputLabel htmlFor='outlined-adornment-role-register'>Role</InputLabel>*/}
                            {/*    <Select*/}
                            {/*        id='outlined-adornment-role-register'*/}
                            {/*        labelId='outlined-adornment-role-register'*/}
                            {/*        value={selectedRole}*/}
                            {/*        name='role'*/}
                            {/*        onChange={(e) => {*/}
                            {/*            handleChange(e);*/}
                            {/*            handleRoleChange(e.target.value);*/}
                            {/*        }}*/}
                            {/*        label='Role'*/}
                            {/*        inputProps={{*/}
                            {/*            classes: {*/}
                            {/*                notchedOutline: classes.notchedOutline*/}
                            {/*            }*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        <MenuItem value=''>*/}
                            {/*            <em>None</em>*/}
                            {/*        </MenuItem>*/}
                            {/*        <MenuItem value={'instructor'}>Instructor</MenuItem>*/}
                            {/*        <MenuItem value={'student'}>Student</MenuItem>*/}
                            {/*    </Select>*/}
                            {/*    {!!submitCount && errors.role && (*/}
                            {/*        <FormHelperText error id='standard-weight-helper-text-password-register'>*/}
                            {/*            {errors.role}*/}
                            {/*        </FormHelperText>*/}
                            {/*    )}*/}
                            {/*</FormControl>*/}

                            {/* <FormControl fullWidth error={Boolean(!!submitCount && errors.role)}
                                         className={classes.selectInput}>
                                <InputLabel htmlFor='outlined-adornment-select-instructor'>Select
                                    Instructor</InputLabel>
                                <Select
                                    id='outlined-adornment-select-instructor'
                                    labelId='outlined-adornment-select-instructor'
                                    value={selectedInstructor}
                                    name='instructor'
                                    onChange={(e) => {
                                        handleChange(e);
                                        handleInstructorChange(e.target.value);
                                    }}
                                    label='Instructor'
                                    inputProps={{
                                        classes: {
                                            notchedOutline: classes.notchedOutline
                                        }
                                    }}
                                >
                                    <MenuItem value=''>
                                        <em>None</em>
                                    </MenuItem>
                                    {
                                        availableInstructors?.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.userId.firstname} {item.userId.lastname}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                                {!!submitCount && errors.role && (
                                    <FormHelperText error id='standard-weight-helper-text-password-register'>
                                        {errors.role}
                                    </FormHelperText>
                                )}
                            </FormControl> */}

                            <Grid container alignItems='center' justifyContent='space-between'>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={agreementChecked}
                                                onChange={(event) => setAgreementChecked(event.target.checked)}
                                                name='checked'
                                                color='primary'
                                            />
                                        }
                                        label={
                                            <Typography variant='subtitle1' color='textSecondary' align='left'>
                                                Agree with &nbsp;
                                                <Link color={'inherit'}
                                                      to={{ pathname: 'https://xr.kent.edu/praxi-privacy-policy' }}
                                                      target='_blank'>
                                                    privacy policy
                                                </Link>
                                                {' & '}
                                                <Link color='inherit'
                                                      to={{ pathname: 'https://xr.kent.edu/praxi-privacy-policy' }}
                                                      target='_blank'>
                                                    user agreement
                                                </Link>
                                            </Typography>
                                        }
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2 }}>
                                <AnimateButton>
                                    <Button
                                        disableElevation
                                        disabled={!agreementChecked || isSubmitting}
                                        fullWidth
                                        size='large'
                                        type='submit'
                                        variant='contained'
                                        color='primary'
                                    >
                                        Sign up
                                    </Button>
                                </AnimateButton>
                            </Box>
                        </form>
                    );
                }}
            </Formik>
            <LoaderBackdrop isLoading={isLoading} />
        </React.Fragment>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.authReducer.isLoading
});

const mapDispatchToProps = (dispatch) => ({
    registerUserAction: (loginObj) => dispatch(registerUserAction(loginObj))
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
