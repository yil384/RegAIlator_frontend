import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import MainCard from '../../ui-component/cards/MainCard';
import { useTheme } from '@material-ui/styles';

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

import LoaderInnerCircular from '../../ui-component/LoaderInnerCircular';

import { useStyles } from './video-groups.styles';

import { fetchVideoGroupDetailsAction } from './video-groups.actions';
import { updateVideoGroup } from './video-groups.helper';

import AnimateButton from '../../ui-component/extended/AnimateButton';
import useScriptRef from '../../hooks/useScriptRef';

import toast from 'react-hot-toast';
import SubCard from '../../ui-component/cards/SubCard';

const VideoGroupDetailsComponent = ({ fetchVideoGroupDetailsAction, isLoading, videoGroupDetails }) => {
    const history = useHistory();
    const theme = useTheme();
    const classes = useStyles();
    const scriptedRef = useScriptRef();
    const { id } = useParams();

    const [selectedAccessState, setSelectedAccessState] = React.useState('public');

    const handleAccessStatusChange = (value) => {
        setSelectedAccessState(value);
    };

    React.useEffect(() => {
        fetchVideoGroupDetailsAction(id);
    }, [id]);

    React.useEffect(() => {
        setSelectedAccessState(videoGroupDetails?.accessState || '');
    }, [videoGroupDetails]);


    return (
        <MainCard title='Video Group Details' boxShadow shadow={theme.shadows[2]}>
            {isLoading ? <LoaderInnerCircular /> : (
                <Box sx={{ ml: 2, mb: 2 }}>

                    <Formik
                        initialValues={{
                            ...videoGroupDetails
                        }}
                        validationSchema={Yup.object().shape({
                            groupName: Yup.string().min(2).required('Group name is required'),
                            accessState: Yup.string().required('Group access state is required')
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                if (scriptedRef.current) {
                                    const { groupName, accessState } = values;
                                    const response = await updateVideoGroup(id, { groupName, accessState });

                                    setStatus({ success: true });
                                    setSubmitting(false);
                                    if (response.id) {
                                        toast.success('Group updated successfully!');
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
                            <form onSubmit={handleSubmit}>
                                <Grid container>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth className={classes.input}>
                                            <InputLabel htmlFor='user-first-name'>Group Name</InputLabel>
                                            <OutlinedInput
                                                id='group-name'
                                                type='text'
                                                value={values?.groupName}
                                                name='groupName'
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label='Group Name'
                                                inputProps={{
                                                    classes: {
                                                        notchedOutline: classes.notchedOutline
                                                    }
                                                }}
                                            />
                                            {errors.groupName && (
                                                <FormHelperText error id='standard-weight-helper-text-group-name'>
                                                    {errors.groupName}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                        <FormControl fullWidth className={classes.selectInput}>
                                            <InputLabel htmlFor='group-access-status'>Access State</InputLabel>
                                            <Select
                                                id='group-access-status'
                                                labelId='group-access-status'
                                                value={selectedAccessState}
                                                name='accessState'
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    handleAccessStatusChange(e.target.value);
                                                }}
                                                label='Access Status'
                                                inputProps={{
                                                    classes: {
                                                        notchedOutline: classes.notchedOutline
                                                    }
                                                }}
                                            >
                                                <MenuItem value=''>
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={'public'}>Public</MenuItem>
                                                <MenuItem value={'private'}>Private</MenuItem>
                                                <MenuItem value={'code_access'}>Code Access</MenuItem>
                                            </Select>
                                            {errors.accessState && (
                                                <FormHelperText error
                                                                id='standard-weight-helper-text-access-state'>
                                                    {errors.accessState}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
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
                                    <Grid item xs={12} sm={4} paddingLeft={4} marginTop={1}>
                                        <FormControl fullWidth>
                                            <SubCard>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant='h4' marginBottom={2}>Details</Typography>
                                                    <Typography variant='subtitle2' marginBottom={1}>
                                                        Created At:
                                                        <span className={classes.valueTxt}>
                                                            {values?.createdAt}
                                                        </span>
                                                    </Typography>
                                                    <Typography variant='subtitle2' marginBottom={1}>
                                                        Last updated:
                                                        <span className={classes.valueTxt}> {values?.updatedAt}</span>
                                                    </Typography>
                                                </Box>
                                            </SubCard>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </form>
                        )}

                    </Formik>
                </Box>
            )}
        </MainCard>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.videoGroupsReducer.isLoading,
    videoGroupDetails: state.videoGroupsReducer.videoGroupDetails
});

const mapDispatchToProps = (dispatch) => ({
    fetchVideoGroupDetailsAction: (groupId) => dispatch(fetchVideoGroupDetailsAction(groupId))
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoGroupDetailsComponent);
