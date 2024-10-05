import React from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import * as Yup from 'yup';
import { Formik } from 'formik';

import {
    Box, Button,
    FormControl,
    FormHelperText,
    Grid, IconButton,
    InputLabel, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem,
    Select,
    Typography
} from '@material-ui/core';
import toast from 'react-hot-toast';
import { Close } from '@material-ui/icons';

import { useTheme } from '@material-ui/styles';

import MainCard from '../../ui-component/cards/MainCard';
import SubCard from '../../ui-component/cards/SubCard';
import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { fetchStudentDetails, updateStudent } from './helper';
import { fetchVideoGroupsAction } from '../video-group/video-groups.actions';


import { useStyles } from './styles';
import { fetchInstructors } from '../instructors/helper';

const StudentDetails = ({ user, fetchVideoGroupsAction, videoGroups, isLoading }) => {
    const theme = useTheme();
    const history = useHistory();
    const { id } = useParams();
    const classes = useStyles();

    const [availableVideoGroups, setAvailableVideoGroups] = React.useState([]);
    const [availableInstructors, setAvailableInstructors] = React.useState([]);
    const [assignedInstructors, setAssignedInstructors] = React.useState([]);
    const [assignedVideoGroups, setAssignedVideoGroups] = React.useState([]);
    const [isFetching, setIsFetching] = React.useState(false);
    const [studentDetails, setStudentDetails] = React.useState({});

    const handleVideoGroupAdd = (value) => {
        const updateVideoGroupUpdate = [...assignedVideoGroups, value];
        const updateAvailableGroups = availableVideoGroups.filter((item) => item.id !== value.id);
        setAvailableVideoGroups(updateAvailableGroups);
        setAssignedVideoGroups(updateVideoGroupUpdate);
    };

    const handleVideoGroupRemove = (value) => {
        const updateVideoGroupUpdate = assignedVideoGroups.filter((item) => item.id !== value.id);
        const updateAvailableGroups = [...availableVideoGroups, value];
        setAvailableVideoGroups(updateAvailableGroups);
        setAssignedVideoGroups(updateVideoGroupUpdate);
    };

    const handleInstructorRemove = (value) => {
        const updateAssignedInst = assignedInstructors.filter((item) => item.id !== value.id);
        const updateAvailableInst = [...availableInstructors, value];
        setAvailableInstructors(updateAvailableInst);
        setAssignedInstructors(updateAssignedInst);
    };

    const handleInstructorAdd = (value) => {
        const updateAssignedInstructor = [...assignedInstructors, value];
        const updateAvailableInstructors = availableInstructors.filter((item) => item.id !== value.id);
        setAvailableInstructors(updateAvailableInstructors);
        setAssignedInstructors(updateAssignedInstructor);
    };

    const loadData = React.useCallback(async () => {
        try {
            await setIsFetching(true);
            const response = await fetchStudentDetails(id);
            await setStudentDetails(response);
            await setAssignedInstructors(response.instructors);
            const assignedVideoGroupsResponse = response?.videoGroups;
            await setAssignedVideoGroups(response?.videoGroups);

            await fetchVideoGroupsAction();
            const availableVGResponse = videoGroups?.results;
            await setAvailableVideoGroups(videoGroups?.results);

            if (assignedVideoGroupsResponse?.length) {
                const filterAvailableVideoGroup = availableVGResponse.filter(function(objFromA) {
                    return !assignedVideoGroupsResponse.find(function(objFromB) {
                        return objFromA.id === objFromB.id;
                    });
                });
                await setAvailableVideoGroups(filterAvailableVideoGroup);
            }

            const instructorResponse = await fetchInstructors();

            const availableInstResponse = instructorResponse.results;

            if (availableInstResponse?.length) {
                const assignedInstrResponse = response.instructors;
                const filterAvailableInstructors = availableInstResponse.filter(function(objFromA) {
                    return !assignedInstrResponse.find(function(objFromB) {
                        return objFromA.id === objFromB.id;
                    });
                });
                await setAvailableInstructors(filterAvailableInstructors);
            }

            setIsFetching(false);
        } catch (e) {
            setIsFetching(false);
        }
    });

    React.useEffect(() => {
        fetchVideoGroupsAction();
        loadData();
    }, []);

    const renderVideoGroups = (vGrps) => {
        return !!vGrps.length ? vGrps.map((item) => (
                <ListItem key={item.id} className={classes.listItem}>
                    <ListItemText
                        primary={item.groupName}
                    />
                    <ListItemSecondaryAction>
                        <IconButton edge='end' aria-label='delete' onClick={() => handleVideoGroupRemove(item)}>
                            <Close />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            )
        ) : <span>No assigned videos</span>;
    };

    const renderInstructors = (instr) => {
        return !!instr.length ? instr.map((item) => (
                <ListItem key={item.id} className={classes.listItem}>
                    <ListItemText
                        primary={`${item?.userId?.firstname} ${item?.userId?.lastname}`}
                    />
                    <ListItemSecondaryAction>
                        <IconButton edge='end' aria-label='delete' onClick={() => handleInstructorRemove(item)}>
                            <Close />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            )
        ) : <span>No assigned instructors</span>;
    };

    return (
        <MainCard title='Student Detail' boxShadow shadow={theme.shadows[2]}>
            {(isFetching || isLoading) ? <LoaderInnerCircular /> : (
                <Formik
                    initialValues={{
                        ...studentDetails,
                        ...studentDetails.userId
                    }}
                    validationSchema={Yup.object().shape({
                        firstname: Yup.string().min(3).max(30).required('First name is required'),
                        lastname: Yup.string().min(3).max(30).required('Last name is required'),
                        email: Yup.string().email('Must be a valid email').max(50).required('Email is required'),
                        role: Yup.string().required('Role is required')
                    })}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {

                            const videoGroupsMapped = assignedVideoGroups.map((item) => item.id);
                            const instructorsMapped = assignedInstructors.map((item) => item.id);
                            const response = await updateStudent(id, {
                                videoGroups: videoGroupsMapped,
                                instructors: instructorsMapped
                            });
                            setStatus({ success: true });
                            setSubmitting(false);
                            if (response.id) {
                                toast.success('User updated successfully!');
                                history.goBack();
                            }
                        } catch (err) {
                            setStatus({ success: false });
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                        <form noValidate onSubmit={handleSubmit}>
                            <Grid container>
                                <Grid item xs={12} sm={4} md={4} paddingLeft={4}>
                                    <FormControl fullWidth className={classes.selectInput}>
                                        {/*<Typography variant={'subtitle1'} className={classes.listTitle}>*/}
                                        {/*    Available Video Groups*/}
                                        {/*</Typography>*/}
                                        <InputLabel htmlFor='outlined-adornment-role-register'>
                                            Select Video Group to Assign
                                        </InputLabel>
                                        <Select
                                            id='outlined-adornment-role-register'
                                            labelId='outlined-adornment-role-register'
                                            value={''}
                                            onChange={(e) => {
                                                // handleChange(e);
                                                e.target.value && handleVideoGroupAdd(e.target.value);
                                            }}
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                }
                                            }}
                                        >
                                            {!!availableVideoGroups?.length ? availableVideoGroups.map((item) => {
                                                return (
                                                    <MenuItem key={item.id} value={item}>
                                                        {item.groupName}
                                                    </MenuItem>
                                                );
                                            }) : (
                                                <MenuItem value={null}>
                                                    <em>No more video groups</em>
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth className={classes.input}>
                                        <Box sx={{ mt: 2, mb: 2 }}>
                                            <SubCard>
                                                <Typography variant={'subtitle1'} className={classes.listTitle}>
                                                    Assigned Video
                                                    Groups <strong>( {assignedVideoGroups?.length} )</strong>
                                                </Typography>
                                                <List>
                                                    {renderVideoGroups(assignedVideoGroups)}
                                                </List>
                                            </SubCard>
                                        </Box>
                                    </FormControl>
                                    <FormControl fullWidth className={classes.selectInput}>
                                        <InputLabel htmlFor='outlined-adornment-instructor-assignment'>
                                            Select Instructors to Assign
                                        </InputLabel>
                                        <Select
                                            id='outlined-adornment-instructor-assignment'
                                            labelId='outlined-adornment-instructor-assignment'
                                            value={''}
                                            onChange={(e) => {
                                                // handleChange(e);
                                                e.target.value && handleInstructorAdd(e.target.value);
                                            }}
                                            inputProps={{
                                                classes: {
                                                    notchedOutline: classes.notchedOutline
                                                }
                                            }}
                                        >
                                            {!!availableInstructors?.length ? availableInstructors.map((item) => {
                                                return (
                                                    <MenuItem key={item.id} value={item}>
                                                        {item.userId?.firstname} {item.userId?.lastname}
                                                    </MenuItem>
                                                );
                                            }) : (
                                                <MenuItem value={null}>
                                                    <em>No more instructors</em>
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth className={classes.input}>
                                        <Box sx={{ mt: 2, mb: 2 }}>
                                            <SubCard>
                                                <Typography variant={'subtitle1'} className={classes.listTitle}>
                                                    Assigned
                                                    Instructors <strong>( {assignedInstructors?.length} )</strong>
                                                </Typography>
                                                <List>
                                                    {renderInstructors(assignedInstructors)}
                                                </List>
                                            </SubCard>
                                        </Box>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={8} md={8} paddingLeft={4} marginTop={1}>
                                    <FormControl fullWidth>
                                        <SubCard>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant='h4' marginBottom={2}>Details</Typography>

                                                <Typography variant='subtitle2' marginBottom={1}>
                                                    First Name:
                                                    <span className={classes.valueTxt}>
                                            {values.firstname}
                                                </span>
                                                </Typography>
                                                <Typography variant='subtitle2' marginBottom={1}>
                                                    Last Name:
                                                    <span className={classes.valueTxt}>
                                            {values.lastname}
                                                </span>
                                                </Typography>
                                                <Typography variant='subtitle2' marginBottom={1}>
                                                    Email:
                                                    <span className={classes.valueTxt}>
                                            {values.email}
                                                </span>
                                                </Typography>
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
                                                    Role:
                                                    <span className={classes.valueTxt}>
                                            {values.role?.toUpperCase()}
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

                            <Grid item xs={12} sm={4} paddingLeft={4}>
                                <Box sx={{ mt: 2, mb: 2 }}>
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
                                </Box>
                            </Grid>
                        </form>
                    )}
                </Formik>
            )}
        </MainCard>
    );
};


const mapStateToProps = (state) => ({
    user: state.authReducer.user,
    isLoading: state.videoGroupsReducer.isLoading,
    videoGroups: state.videoGroupsReducer.videoGroups
});

const mapDispatchToProps = (dispatch) => ({
    fetchVideoGroupsAction: (obj) => dispatch(fetchVideoGroupsAction(obj))
});

export default connect(mapStateToProps, mapDispatchToProps)(StudentDetails);

