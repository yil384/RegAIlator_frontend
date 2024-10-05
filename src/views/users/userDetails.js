import React from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import * as Yup from 'yup';
import { Formik } from 'formik';

import {
    Box, Button,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel, MenuItem,
    OutlinedInput, Select,
    Typography
} from '@material-ui/core';

import { useTheme } from '@material-ui/styles';

import MainCard from '../../ui-component/cards/MainCard';
import SubCard from '../../ui-component/cards/SubCard';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { fetchUserDetailsAction } from './users.actions';
import { updateUser } from './users.helper';
import useScriptRef from '../../hooks/useScriptRef';


import { useStyles } from './users.styles';
import toast from 'react-hot-toast';

const UserDetails = ({ fetchUserDetailsAction, isLoading, userDetails, user }) => {
    const theme = useTheme();
    const history = useHistory();
    const { id } = useParams();
    const classes = useStyles();
    const scriptedRef = useScriptRef();

    const [selectedRole, setSelectedRole] = React.useState('');

    const handleRoleChange = (value) => {
        setSelectedRole(value);
    };

    React.useEffect(() => {
        fetchUserDetailsAction(id);
    }, [fetchUserDetailsAction, id]);

    React.useEffect(() => {
        setSelectedRole(userDetails?.role || '');
    }, [userDetails]);


    return (
        <MainCard title='User Detail' boxShadow shadow={theme.shadows[2]}>
            {isLoading ? <LoaderInnerCircular /> : (
                <Formik
                    initialValues={{
                        ...userDetails
                    }}
                    validationSchema={Yup.object().shape({
                        firstname: Yup.string().min(3).max(30).required('First name is required'),
                        lastname: Yup.string().min(3).max(30).required('Last name is required'),
                        email: Yup.string().email('Must be a valid email').max(50).required('Email is required'),
                        role: Yup.string().required('Role is required')
                    })}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            if (scriptedRef.current) {
                                const { firstname, lastname, email } = values;
                                const response = await updateUser(id, { firstname, lastname, email });

                                setStatus({ success: true });
                                setSubmitting(false);
                                if (response.id) {
                                    toast.success('User updated successfully!');
                                    history.goBack();
                                }
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
                            <Grid container>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth className={classes.input}
                                                 disabled={user?.role === 'student'}>
                                        <InputLabel htmlFor='user-first-name'>First Name</InputLabel>
                                        <OutlinedInput
                                            id='user-first-name'
                                            type='text'
                                            value={values?.firstname}
                                            name='firstname'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label='First Name'
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                }
                                            }}
                                        />
                                        {errors.firstname && (
                                            <FormHelperText error id='standard-weight-helper-text-user-first-name'>
                                                {errors.firstname}
                                            </FormHelperText>
                                        )}
                                    </FormControl>

                                    <FormControl fullWidth className={classes.input}
                                                 disabled={user?.role === 'student'}>
                                        <InputLabel htmlFor='user-first-name'>Last Name</InputLabel>
                                        <OutlinedInput
                                            id='user-last-name'
                                            type='text'
                                            value={values?.lastname}
                                            name='lastname'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label='First Name'
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                }
                                            }}
                                        />
                                        {errors.lastname && (
                                            <FormHelperText error id='standard-weight-helper-text-user-first-name'>
                                                {errors.lastname}
                                            </FormHelperText>
                                        )}
                                    </FormControl>

                                    <FormControl fullWidth className={classes.input}
                                                 disabled={user?.role === 'student'}>
                                        <InputLabel htmlFor='outlined-adornment-email'>Email
                                            Address</InputLabel>
                                        <OutlinedInput
                                            id='outlined-adornment-email'
                                            type='email'
                                            value={values.email}
                                            name='email'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                }
                                            }}
                                        />
                                        {errors.email && (
                                            <FormHelperText error id='standard-weight-helper-text-email'>
                                                {errors.email}
                                            </FormHelperText>
                                        )}
                                    </FormControl>

                                    <FormControl fullWidth className={classes.selectInput} disabled>
                                        <InputLabel htmlFor='outlined-adornment-role-register'>Role</InputLabel>
                                        <Select
                                            id='outlined-adornment-role-register'
                                            labelId='outlined-adornment-role-register'
                                            value={selectedRole}
                                            name='role'
                                            onChange={(e) => {
                                                handleChange(e);
                                                handleRoleChange(e.target.value);
                                            }}
                                            label='Role'
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                }
                                            }}
                                        >
                                            <MenuItem value=''>
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value={'admin'}>Admin</MenuItem>
                                            <MenuItem value={'instructor'}>Instructor</MenuItem>
                                            <MenuItem value={'student'}>Student</MenuItem>
                                        </Select>
                                        {errors.role && (
                                            <FormHelperText error
                                                            id='standard-weight-helper-text-password-register'>
                                                {errors.role}
                                            </FormHelperText>
                                        )}
                                    </FormControl>

                                    {!(user?.role === 'student') && (<Box sx={{ mt: 2, mb: 2 }}>
                                        <AnimateButton>
                                            <Button
                                                disableElevation
                                                disabled={isLoading}
                                                fullWidth
                                                size='large'
                                                type='submit'
                                                variant='contained'
                                                color='primary'
                                            >
                                                Update
                                            </Button>
                                        </AnimateButton>
                                    </Box>)}
                                </Grid>

                                <Grid item xs={12} sm={8} paddingLeft={4} marginTop={1}>
                                    <FormControl fullWidth>
                                        <SubCard>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant='h4' marginBottom={2}>Details</Typography>

                                                <Typography variant='subtitle2' marginBottom={1}>
                                                    Username:
                                                    <span className={classes.valueTxt}>
                                                            {values.username}
                                                        </span>
                                                </Typography>
                                                <Typography variant='subtitle2' marginBottom={1}>
                                                    Email verification:
                                                    <span className={classes.valueTxt}>
                                                            {values.isEmailVerified ? ' Verified' : ' Not Verified'}
                                                        </span>
                                                </Typography>
                                                <Typography variant='subtitle2' marginBottom={1}>
                                                    Created At:
                                                    <span className={classes.valueTxt}>
                                                            {values.createdAt}
                                                        </span>
                                                </Typography>
                                                <Typography variant='subtitle2' marginBottom={1}>
                                                    Last updated:
                                                    <span className={classes.valueTxt}> {values.updatedAt}</span>
                                                </Typography>
                                            </Box>
                                        </SubCard>
                                    </FormControl>
                                </Grid>
                            </Grid>

                        </form>
                    )}
                </Formik>
            )}
        </MainCard>
    );
};


const mapStateToProps = (state) => ({
    isLoading: state.usersReducer.isLoading,
    userDetails: state.usersReducer.userDetails,
    user: state.authReducer.user
});

const mapDispatchToProps = (dispatch) => ({
    fetchUserDetailsAction: (userID) => dispatch(fetchUserDetailsAction(userID))
});

export default connect(mapStateToProps, mapDispatchToProps)(UserDetails);

